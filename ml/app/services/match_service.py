from __future__ import annotations

import json
from typing import Any, Iterable, List, Tuple

from app.prompts import (
    MATCH_PREPROCESS_SYSTEM_PROMPT,
    MATCH_SYSTEM_PROMPT_STAGE1,
    MATCH_SYSTEM_PROMPT_STAGE2,
    MATCH_FUTURE_RESUME_SYSTEM_PROMPT,
    COURSE_PREPROCESS_SYSTEM_PROMPT,
    COURSE_MATCH_SYSTEM_PROMPT_STAGE1,
    COURSE_MATCH_SYSTEM_PROMPT_STAGE2,
)
from app.services.yandex_sdk import embed_text, run_structured_completion, run_text_completion
from app.startup.load_embeddings import search_top_k, search_top_k_courses
from app.models.match_models import (
    MatchVacanciesRequest,
    MatchVacanciesResponse,
    MatchedVacancy,
    MatchCoursesRequest,
    MatchCoursesResponse,
    MatchedCourse,
    MatchFutureRequest,
)
from app.repos.match_repos import VacanciesRepository, CoursesRepository


def _dedup_vacancies_ordered(items: List[dict[str, Any]]) -> List[dict[str, Any]]:
    seen: set[Tuple[str, str, str, str, str, str]] = set()
    out: List[dict[str, Any]] = []
    for d in items:
        key = (
            str(d.get("title", "") or ""),
            str(d.get("salary", "") or ""),
            str(d.get("experience", "") or ""),
            str(d.get("job_type", "") or ""),
            str(d.get("company", "") or ""),
            str(d.get("location", "") or ""),
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(d)
    return out


def _dedup_courses_ordered(items: List[dict[str, Any]]) -> List[dict[str, Any]]:
    seen: set[Tuple[str, str, str, str, str]] = set()
    out: List[dict[str, Any]] = []
    for d in items:
        key = (
            str(d.get("Course Name", "") or ""),
            str(d.get("University", "") or ""),
            str(d.get("Difficulty Level", "") or ""),
            str(d.get("Course Rating", "") or ""),
            str(d.get("Course URL", "") or ""),
        )
        if key in seen:
            continue
        seen.add(key)
        out.append(d)
    return out


class MatchService:
    def preprocess_resume(self, resume: str) -> str:
        txt = run_text_completion([
            {"role": "system", "text": MATCH_PREPROCESS_SYSTEM_PROMPT},
            {"role": "user", "text": resume},
        ]).strip()
        return txt or resume

    def embed_query(self, text: str) -> Any:
        return embed_text(text, model_kind="query")

    async def fetch_vacancies_in_order(self, repo, top_idx: Iterable[int]) -> List[dict[str, Any]]:
        docs = await repo.find_by_idx(top_idx)
        by_idx = {int(d["idx"]): d for d in docs if "idx" in d}
        ordered = [by_idx.get(int(i)) for i in top_idx if int(i) in by_idx]
        return [d for d in ordered if d is not None]

    async def fetch_courses_in_order(self, repo, top_idx: Iterable[int]) -> List[dict[str, Any]]:
        docs = await repo.find_by_idx(top_idx)
        by_idx = {int(d["idx"]): d for d in docs if "idx" in d}
        ordered = [by_idx.get(int(i)) for i in top_idx if int(i) in by_idx]
        return [d for d in ordered if d is not None]

    def stage1_select(self, system_prompt: str, context_text: str, limit: int) -> List[int]:
        schema = {
            "title": "PickN",
            "type": "object",
            "properties": {"selected": {"type": "array", "items": {"type": "integer"}}},
            "required": ["selected"],
        }
        raw = run_structured_completion([
            {"role": "system", "text": system_prompt.format(limit=limit)},
            {"role": "user", "text": context_text},
        ], schema, max_tokens=800)
        try:
            data = json.loads(raw)
            selected = [int(x) for x in data.get("selected", []) if isinstance(x, int)]
        except Exception:
            selected = []
        return selected[:limit]

    def stage2_select(self, system_prompt: str, detail_text: str, limit: int) -> List[int]:
        return self.stage1_select(system_prompt, detail_text, limit)

    def search_faiss(self, q_vec, k: int) -> Any:
        return search_top_k(q_vec, k=k)

    def search_faiss_courses(self, q_vec, k: int) -> Any:
        return search_top_k_courses(q_vec, k=k)

    def mk_vacancy_block(self, d: dict[str, Any]) -> str:
        return (
            f"{d.get('idx')}: {d.get('title','')}\n"
            f"Описание: {d.get('description','')}\n"
            f"Навыки: {d.get('key_skills','')}\n"
            f"Локация: {d.get('location','')}\n"
        )

    def mk_course_block(self, d: dict[str, Any]) -> str:
        return (
            f"{d.get('idx')}: {d.get('Course Name','')}\n"
            f"Уровень: {d.get('Difficulty Level','')}\n"
            f"Описание: {d.get('Course Description','')}\n"
            f"Навыки: {d.get('Skills','')}\n"
        )

    def preprocess_courses_query(self, desired_skills: str, field: str | None, specialization: str | None) -> str:
        q_text = (f"Сфера: {field or ''}\nСпециализация: {specialization or ''}\nЦелевые навыки: {desired_skills}")
        txt = run_text_completion([
            {"role": "system", "text": COURSE_PREPROCESS_SYSTEM_PROMPT},
            {"role": "user", "text": q_text},
        ]).strip()
        return txt or desired_skills

    def build_future_text(
        self,
        field: str,
        specialization: str,
        activities: str,
        desired_role: str,
        salary_expectation: str,
        additional_info: str | None,
        desired_level: str | None,
    ) -> str:
        goals_text = (
            f"Сфера: {field}\nСпециализация: {specialization}\n"
            f"Активности/функции: {activities}\nЖелаемая роль: {desired_role}\n"
            f"Ожидания по зарплате: {salary_expectation}\n"
            f"Целевой уровень: {desired_level or 'Нет'}"
            f"Дополнительная информация: {additional_info or 'Нет'}"
        )
        txt = run_text_completion([
            {"role": "system", "text": MATCH_FUTURE_RESUME_SYSTEM_PROMPT},
            {"role": "user", "text": goals_text},
        ]).strip()
        return txt

    async def match_vacancies(
        self,
        request: MatchVacanciesRequest,
        repo: VacanciesRepository,
    ) -> MatchVacanciesResponse:
        # Preprocess and embed
        aug_text = self.preprocess_resume(request.resume)
        q_vec = self.embed_query(aug_text)
        top_idx_arr = self.search_faiss(q_vec, k=int(request.k_faiss))

        # Fetch ordered docs
        ordered = await self.fetch_vacancies_in_order(repo, top_idx_arr)
        ordered = _dedup_vacancies_ordered(ordered)
        if not ordered:
            return MatchVacanciesResponse(top_idx=[], stage1=[], result=[])

        # Stage 1 by titles
        items = [f"{d['idx']}: {d.get('title','')}" for d in ordered]
        list_text = "\n---\n".join(items)
        context1 = (
            f"Резюме кандидата:\n{request.resume}\n\nСписок вакансий (id: title):\n{list_text}"
        )
        stage1_selected = set(self.stage1_select(MATCH_SYSTEM_PROMPT_STAGE1, context1, int(request.k_stage1)))
        stage2 = [d for d in ordered if int(d["idx"]) in stage1_selected][: int(request.k_stage1)] or ordered[: int(request.k_stage1)]

        # Stage 2 by details
        details = "\n------\n".join(self.mk_vacancy_block(d) for d in stage2)
        context2 = (
            f"Резюме кандидата:\n{request.resume}\n\nКандидаты (подробно):\n{details}"
        )
        stage2_selected = set(self.stage2_select(MATCH_SYSTEM_PROMPT_STAGE2, context2, int(request.k_stage2)))
        final = [d for d in stage2 if int(d["idx"]) in stage2_selected][: int(request.k_stage2)] or stage2[: int(request.k_stage2)]

        return MatchVacanciesResponse(
            top_idx=list(map(int, top_idx_arr.tolist())),
            stage1=list(map(int, stage1_selected)),
            result=[
                MatchedVacancy(
                    idx=int(d["idx"]),
                    title=d.get("title", ""),
                    company=d.get("company", ""),
                    location=d.get("location", ""),
                    salary=d.get("salary", ""),
                    experience=d.get("experience", ""),
                    description=d.get("description", ""),
                )
                for d in final
            ],
        )

    async def match_courses(
        self,
        request: MatchCoursesRequest,
        repo: CoursesRepository,
    ) -> MatchCoursesResponse:
        # Preprocess and embed
        aug_query = self.preprocess_courses_query(request.desired_skills, request.field, request.specialization)
        q_vec = self.embed_query(aug_query)
        top_idx_arr = self.search_faiss_courses(q_vec, k=int(request.k_faiss))

        # Fetch ordered docs
        ordered = await self.fetch_courses_in_order(repo, top_idx_arr)
        ordered = _dedup_courses_ordered(ordered)
        if not ordered:
            return MatchCoursesResponse(top_idx=[], stage1=[], result=[])

        # Stage 1 by course names
        items = [f"{d['idx']}: {d.get('Course Name','')}" for d in ordered]
        list_text = "\n---\n".join(items)
        context1 = (
            f"Запрос пользователя (навыки/цели):\n{aug_query}\n\nКурсы (id: name):\n{list_text}"
        )
        stage1_selected = set(self.stage1_select(COURSE_MATCH_SYSTEM_PROMPT_STAGE1, context1, int(request.k_stage1)))
        stage2 = [d for d in ordered if int(d["idx"]) in stage1_selected][: int(request.k_stage1)] or ordered[: int(request.k_stage1)]

        # Stage 2 by details
        details = "\n------\n".join(self.mk_course_block(d) for d in stage2)
        context2 = (
            f"Запрос пользователя (навыки/цели):\n{aug_query}\n\nКурсы (подробно):\n{details}"
        )
        stage2_selected = set(self.stage2_select(COURSE_MATCH_SYSTEM_PROMPT_STAGE2, context2, int(request.k_stage2)))
        final = [d for d in stage2 if int(d["idx"]) in stage2_selected][: int(request.k_stage2)] or stage2[: int(request.k_stage2)]

        return MatchCoursesResponse(
            top_idx=list(map(int, top_idx_arr.tolist())),
            stage1=list(map(int, stage1_selected)),
            result=[
                MatchedCourse(
                    idx=int(d["idx"]),
                    name=d.get("Course Name", ""),
                    university=d.get("University", ""),
                    level=d.get("Difficulty Level", ""),
                    rating=d.get("Course Rating", ""),
                    url=d.get("Course URL", ""),
                )
                for d in final
            ],
        )

    async def match_future(
        self,
        request: MatchFutureRequest,
        repo: VacanciesRepository,
    ) -> MatchVacanciesResponse:
        # Build future text and reuse pipeline
        future_text = self.build_future_text(
            request.field,
            request.specialization,
            request.activities,
            request.desired_role,
            request.salary_expectation,
            request.additional_info,
            request.desired_level,
        )
        q_vec = self.embed_query(future_text)
        top_idx_arr = self.search_faiss(q_vec, k=int(request.k_faiss))

        ordered = await self.fetch_vacancies_in_order(repo, top_idx_arr)
        ordered = _dedup_vacancies_ordered(ordered)
        if not ordered:
            return MatchVacanciesResponse(top_idx=[], stage1=[], result=[])

        items = [f"{d['idx']}: {d.get('title','')}" for d in ordered]
        list_text = "\n---\n".join(items)
        context1 = (
            f"Будущая роль кандидата:\n{future_text}\n\nСписок вакансий (id: title):\n{list_text}"
        )
        stage1_selected = set(self.stage1_select(MATCH_SYSTEM_PROMPT_STAGE1, context1, int(request.k_stage1)))
        stage2 = [d for d in ordered if int(d["idx"]) in stage1_selected][: int(request.k_stage1)] or ordered[: int(request.k_stage1)]

        details = "\n------\n".join(self.mk_vacancy_block(d) for d in stage2)
        context2 = (
            f"Будущая роль кандидата:\n{future_text}\n\nКандидаты (подробно):\n{details}"
        )
        stage2_selected = set(self.stage2_select(MATCH_SYSTEM_PROMPT_STAGE2, context2, int(request.k_stage2)))
        final = [d for d in stage2 if int(d["idx"]) in stage2_selected][: int(request.k_stage2)] or stage2[: int(request.k_stage2)]

        return MatchVacanciesResponse(
            top_idx=list(map(int, top_idx_arr.tolist())),
            stage1=list(map(int, stage1_selected)),
            result=[
                MatchedVacancy(
                    idx=int(d["idx"]),
                    title=d.get("title", ""),
                    company=d.get("company", ""),
                    location=d.get("location", ""),
                    salary=d.get("salary", ""),
                    experience=d.get("experience", ""),
                    description=d.get("description", ""),
                )
                for d in final
            ],
        )


