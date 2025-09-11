from __future__ import annotations

import logging
import time
from typing import List

from app.models import UserProfile
from app.models.trajectory_models import (
    TrajectoryBuildRequest,
    TrajectoryResponse,
)
from app.models.match_models import MatchVacanciesRequest, MatchFutureRequest
from app.repos.chat_repos import SessionsRepository, MessagesRepository
from app.repos.match_repos import VacanciesRepository, CoursesRepository
from app.repos.trajectory_repo import TrajectoryRepository
from app.services.profile_service import ProfileService
from app.services.match_service import MatchService
from app.services.gap_service import GapService
from app.services.learning_service import LearningService
from app.services.planner_service import PlannerService


class TrajectoryService:
    def __init__(self) -> None:
        self.profile_service = ProfileService()
        self.match_service = MatchService()
        self.gap_service = GapService()
        self.learning_service = LearningService()
        self.planner_service = PlannerService()
        self.logger = logging.getLogger(__name__)

    async def build(
        self,
        req: TrajectoryBuildRequest,
        sessions_repo: SessionsRepository,
        messages_repo: MessagesRepository,
        vacancies_repo: VacanciesRepository,
        courses_repo: CoursesRepository,
        traj_repo: TrajectoryRepository,
    ) -> TrajectoryResponse:
        # 1) profile
        t0 = time.perf_counter()
        profile_dict = await self.profile_service.build_profile(req.session_id, sessions_repo, messages_repo)
        t1 = time.perf_counter()
        self.logger.info("Trajectory: build_profile took %.3fs", (t1 - t0))
        profile = UserProfile.model_validate(profile_dict["profile"])  # type: ignore[arg-type]

        # 2) current vacancies (from full resume)
        resume_text = self._resume_text_from_full_profile(profile)
        t0 = time.perf_counter()
        current = await self.match_service.match_vacancies(
            MatchVacanciesRequest(resume=resume_text, k_faiss=200, k_stage1=50, k_stage2=req.current_positions_limit),
            vacancies_repo,
        )
        t1 = time.perf_counter()
        self.logger.info("Trajectory: match current vacancies took %.3fs (count=%d)", (t1 - t0), len(current.result))

        # 3) future vacancies (from goals)
        goals = profile.goals
        t0 = time.perf_counter()
        future = await self.match_service.match_future(
            MatchFutureRequest(
                field=goals.target_field if goals and goals.target_field else "",
                specialization=goals.target_specialization if goals and goals.target_specialization else "",
                activities=", ".join(goals.desired_activities) if goals and goals.desired_activities else "",
                desired_role=goals.desired_role or "",
                desired_level=goals.desired_level,
                salary_expectation=(str(goals.salary_expectation.min) if goals and goals.salary_expectation and goals.salary_expectation.min is not None else ""),
                additional_info=None,
                k_faiss=200,
                k_stage1=50,
                k_stage2=req.target_positions_limit,
            ),
            vacancies_repo,
        )
        t1 = time.perf_counter()
        self.logger.info("Trajectory: match future vacancies took %.3fs (count=%d)", (t1 - t0), len(future.result))

        # 4) gaps (on group of future vacancies)
        future_docs = [v.model_dump() for v in future.result]
        t0 = time.perf_counter()
        gaps = self.gap_service.extract_gaps(profile, future_docs, limit=5)
        t1 = time.perf_counter()
        self.logger.info("Trajectory: gap extraction took %.3fs (count=%d)", (t1 - t0), len(gaps))

        # 5) recommendations for gaps
        # determine field/specialization from goals or professional_context
        field = None
        specialization = None
        if profile.goals:
            field = profile.goals.target_field or None
            specialization = profile.goals.target_specialization or None
        if (not field or not specialization) and profile.professional_context:
            field = field or profile.professional_context.professional_field
            specialization = specialization or profile.professional_context.specialization

        t0 = time.perf_counter()
        await self.learning_service.enrich_with_courses(gaps, courses_repo, k=2, field=field, specialization=specialization)
        t1 = time.perf_counter()
        self.logger.info("Trajectory: courses enrichment took %.3fs", (t1 - t0))

        t0 = time.perf_counter()
        await self.learning_service.enrich_with_projects_and_tips(gaps, limit=2)
        t1 = time.perf_counter()
        self.logger.info("Trajectory: LLM recs enrichment took %.3fs", (t1 - t0))

        # 6) plan groups under constraints
        t0 = time.perf_counter()
        groups = self.planner_service.group_gaps(gaps, weekly_hours=req.weekly_hours, total_months=req.total_months)
        t1 = time.perf_counter()
        self.logger.info(
            "Trajectory: planning took %.3fs (groups=%d, weekly_hours=%d, total_months=%d)",
            (t1 - t0),
            len(groups),
            req.weekly_hours,
            req.total_months,
        )

        response = TrajectoryResponse(
            session_id=req.session_id,
            current_positions=current.result,
            groups=groups,
            future_positions=future.result,
        )

        # Get user_id from session
        session = await sessions_repo.find_by_id(req.session_id)
        user_id = session.get("user_id") if session else None

        t0 = time.perf_counter()
        await traj_repo.upsert(req.session_id, response.model_dump(), user_id)
        t1 = time.perf_counter()
        self.logger.info("Trajectory: persist took %.3fs", (t1 - t0))
        return response

    def _resume_text_from_full_profile(self, profile: UserProfile) -> str:
        def to_str_list(values) -> List[str]:
            out: List[str] = []
            if not values:
                return out
            for v in values:
                if isinstance(v, str):
                    out.append(v)
                elif isinstance(v, (int, float)):
                    out.append(str(v))
                # skip nested lists/dicts/None
            return out

        parts: List[str] = []
        if profile.resume:
            for job in profile.resume:
                parts.append(f"Роль: {job.title or ''} в {job.company or ''} ({job.start_date or ''} - {job.end_date or 'н.в.'})")
                tasks = to_str_list(getattr(job, "tasks", []))
                if tasks:
                    parts.append("Задачи: " + "; ".join(tasks[:6]))
                tech = to_str_list(getattr(job, "tech_stack", []))
                if tech:
                    parts.append("Технологии: " + ", ".join(tech[:10]))
                tools = to_str_list(getattr(job, "tools", []))
                if tools:
                    parts.append("Инструменты: " + ", ".join(tools[:10]))
        if profile.skills:
            hs = to_str_list(getattr(profile.skills, "hard_skills", []))
            if hs:
                parts.append("Hard skills: " + ", ".join(hs[:12]))
            stack = to_str_list(getattr(profile.skills, "tech_stack", []))
            if stack:
                parts.append("Stack: " + ", ".join(stack[:12]))
        resume_text = "\n".join(parts) or ""
        self.logger.info("Trajectory: resume text (full): %s", resume_text)
        return resume_text

