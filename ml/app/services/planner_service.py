from __future__ import annotations

import json
import logging
import time
from typing import List

from app.models.trajectory_models import GapItem, GapGroup
from app.services.yandex_sdk import run_structured_completion
from app.prompts import PLANNER_SYSTEM_PROMPT, PLANNER_USER_INSTRUCTIONS


PLANNER_SCHEMA = {
    "title": "GapGroups",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "group_id": {"type": "integer"},
            "title": {"type": "string"},
            "estimated_months": {"type": "integer"},
            "hours_per_week": {"type": "integer"},
            "items": {"type": "array", "items": {"type": "string"}},
            "notes": {"type": "string"},
        },
        "required": ["group_id", "title", "estimated_months", "hours_per_week", "items", "notes"],
    },
}


class PlannerService:

    def group_gaps(self, gaps: List[GapItem], weekly_hours: int, total_months: int) -> List[GapGroup]:
        # Prepare LLM input
        gaps_payload = []
        for g in gaps:
            gaps_payload.append(
                {
                    "name": g.name,
                    "kind": g.kind,
                    "priority": g.priority,
                    "prerequisites": g.prerequisites,
                    "est_hours": max(10, g.total_hours() or 10),
                }
            )
        user_text = (
            f"weekly_hours={int(max(2, weekly_hours))}\n"
            f"total_months={int(max(1, total_months))}\n"
            f"gaps={gaps_payload}"
        )
        
        logger = logging.getLogger(__name__)
        messages = [
            {"role": "system", "text": PLANNER_SYSTEM_PROMPT},
            {"role": "user", "text": f"{PLANNER_USER_INSTRUCTIONS}\n\n{user_text}"},
        ]

        t0 = time.perf_counter()
        raw = run_structured_completion(messages, PLANNER_SCHEMA)
        t1 = time.perf_counter()
        logger.info("Planner: llm grouping took %.3fs (gaps=%d)", (t1 - t0), len(gaps))

        data = json.loads(raw)
        groups: List[GapGroup] = []
        for item in data:
            try:
                names = set(item.get("items", []))
                groups.append(
                    GapGroup(
                        group_id=int(item.get("group_id", len(groups) + 1)),
                        title=item.get("title", f"Группа {len(groups) + 1}"),
                        estimated_months=int(item.get("estimated_months", 1)),
                        hours_per_week=int(item.get("hours_per_week", weekly_hours)),
                        items=[g for g in gaps if g.name in names],
                        notes=item.get("notes"),
                    )
                )
            except Exception:
                continue
        if groups:
            return groups



