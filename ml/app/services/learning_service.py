from __future__ import annotations

import logging
import time
from typing import List, Optional

from app.models.trajectory_models import GapItem, RecommendationItem
from app.repos.match_repos import CoursesRepository
from app.services.match_service import MatchService
from app.models.match_models import MatchCoursesRequest
from app.services.yandex_sdk import run_structured_completion
from app.prompts import RECS_SYSTEM_PROMPT, RECS_USER_INSTRUCTIONS


RECS_SCHEMA = {
    "title": "Recommendations",
    "description": "Рекомендации (проекты и советы) для закрытия gap.",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "type": {"type": "string", "enum": ["project", "tip"], "description": "Тип рекомендации"},
            "title": {"type": "string", "description": "Название/идея"},
            "url": {"type": "string", "description": "Ссылка"},
            "provider": {"type": "string", "description": "Источник"},
            "duration_hours": {"type": "integer", "description": "Оценка часов"},
            "estimated_months": {"type": "integer", "description": "Оценка месяцев"},
            "expected_outcomes": {"type": "string", "description": "Ожидаемые результаты"},
            "cost": {"type": "string", "description": "Стоимость"},
            "required": {"type": "boolean", "description": "Обязательно"},
        },
        "required": [
            "type",
            "title",
            "url",
            "provider",
            "duration_hours",
            "estimated_months",
            "expected_outcomes",
            "cost",
            "required",
        ],
    },
}


class LearningService:
    def __init__(self) -> None:
        self._match = MatchService()
        self._logger = logging.getLogger(__name__)

    async def enrich_with_courses(
        self,
        gaps: List[GapItem],
        courses_repo: CoursesRepository,
        k: int = 5,
        field: Optional[str] = None,
        specialization: Optional[str] = None,
    ) -> None:
        for gap in gaps:
            query = f"{gap.name} ({gap.kind})"
            try:
                t0 = time.perf_counter()
                req = MatchCoursesRequest(
                    desired_skills=query,
                    field=field,
                    specialization=specialization,
                    k_faiss=100,
                    k_stage1=min(20, k * 3),
                    k_stage2=k,
                )
                resp = await self._match.match_courses(req, courses_repo)
                courses = resp.result[:k]
                t1 = time.perf_counter()
                self._logger.info("Learning: courses for '%s' took %.3fs (k=%d)", gap.name, (t1 - t0), len(courses))
            except Exception:
                courses = []
            for c in courses:
                gap.recommendations.append(
                    RecommendationItem(
                        type="course",
                        title=c.name or "",
                        url=c.url,
                        provider=c.university,
                        duration_hours=None,
                        expected_outcomes=None,
                        required=False,
                    )
                )

    async def enrich_with_projects_and_tips(self, gaps: List[GapItem], limit: int = 2) -> None:
        for gap in gaps:
            user_text = RECS_USER_INSTRUCTIONS + f"\nВерни не более {int(limit)} элементов."
            messages = [
                {"role": "system", "text": RECS_SYSTEM_PROMPT},
                {"role": "user", "text": f"Gap: {gap.name} ({gap.kind}). {user_text}"},
            ]
            try:
                t0 = time.perf_counter()
                raw = run_structured_completion(messages, RECS_SCHEMA)
                import json

                data = json.loads(raw)
                t1 = time.perf_counter()
                self._logger.info("Learning: llm recs for '%s' took %.3fs (n=%d)", gap.name, (t1 - t0), len(data))
            except Exception:
                data = []
            for r in data[: int(limit)]:
                try:
                    gap.recommendations.append(
                        RecommendationItem(
                            type=r.get("type", "tip"),
                            title=r.get("title", ""),
                            url=r.get("url"),
                            provider=r.get("provider"),
                            duration_hours=r.get("duration_hours"),
                            estimated_months=r.get("estimated_months"),
                            expected_outcomes=r.get("expected_outcomes"),
                            cost=r.get("cost"),
                            required=bool(r.get("required", False)),
                        )
                    )
                except Exception:
                    continue


