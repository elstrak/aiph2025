from __future__ import annotations

import json
import logging
import time
from typing import List, Dict, Any

from app.models.schemas import UserProfile
from app.models.trajectory_models import GapItem
from app.services.yandex_sdk import run_structured_completion
from app.prompts import GAP_ANALYSIS_SYSTEM_PROMPT, GAP_ANALYSIS_USER_INSTRUCTIONS


GAP_SCHEMA = {
    "title": "Gaps",
    "description": "Список обучающих разрывов (gaps) между текущим профилем и целевыми вакансиями.",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "name": {"type": "string", "description": "Название gap (навык/опыт/уровень)"},
            "kind": {
                "type": "string",
                "enum": ["skill", "experience", "level"],
                "description": "Тип gap: skill (навык), experience (опыт), level (уровень)",
            },
            "priority": {
                "type": "integer",
                "minimum": 1,
                "maximum": 5,
                "description": "Приоритет (1=высокий, 5=низкий)",
            },
            "prerequisites": {
                "type": "array",
                "items": {"type": "string"},
                "description": "Список имен gap, которые должны быть закрыты раньше",
            },
            "rationale": {"type": "string", "description": "Почему этот gap важен"},
        },
        "required": ["name", "kind", "priority", "prerequisites", "rationale"],
    },
}


class GapService:
    def __init__(self) -> None:
        self._logger = logging.getLogger(__name__)

    def build_prompt(self, profile: UserProfile, future_vacancies: List[Dict[str, Any]], limit: int = 10) -> List[Dict[str, str]]:
        future_block = "\n\n".join(
            f"{v['title']} @ {v['company']}\n"
            f"Опыт: {v.get('experience','')}\nЛокация: {v.get('location','')}\nОписание: {v.get('description','')}"
            for v in future_vacancies[:10]
        )
        profile_text = profile.model_dump_json()
        user_text = GAP_ANALYSIS_USER_INSTRUCTIONS + f"\nВерни не более {int(limit)} элементов в массиве."
        return [
            {"role": "system", "text": GAP_ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "text": f"Профиль:\n{profile_text}\n\nБудущие вакансии:\n{future_block}\n\n{user_text}"},
        ]

    def extract_gaps(self, profile: UserProfile, future_vacancies: List[Dict[str, Any]], limit: int = 10) -> List[GapItem]:
        messages = self.build_prompt(profile, future_vacancies, limit=limit)
        t0 = time.perf_counter()
        raw = run_structured_completion(messages, GAP_SCHEMA)
        t1 = time.perf_counter()
        self._logger.info("Gaps: llm extraction took %.3fs", (t1 - t0))
        try:
            data = json.loads(raw)
        except Exception:
            data = []
        gaps: List[GapItem] = []
        for g in data:
            try:
                gaps.append(
                    GapItem(
                        name=str(g.get("name", "")),
                        kind=str(g.get("kind", "skill")),
                        priority=int(g.get("priority", 3)),
                        prerequisites=[str(x) for x in g.get("prerequisites", [])],
                        recommendations=[],
                        rationale=str(g.get("rationale", "")) or None,
                    )
                )
            except Exception:
                continue
        gaps.sort(key=lambda x: (x.priority, x.name))
        return gaps[: int(limit)]


