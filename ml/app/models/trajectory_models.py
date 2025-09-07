from __future__ import annotations

from math import ceil
from typing import List, Optional, Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.match_models import MatchedVacancy


class RecommendationItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    type: Literal["course", "project", "tip"] = Field(description="Тип рекомендации")
    title: str = Field(description="Название/идея")
    url: Optional[str] = Field(default=None, description="Ссылка (если есть)")
    provider: Optional[str] = Field(default=None, description="Провайдер/источник")
    duration_hours: Optional[int] = Field(default=None, description="Оценка часов")
    estimated_months: Optional[int] = Field(default=None, description="Оценка сроков (мес.)")
    expected_outcomes: Optional[str] = Field(default=None, description="Ожидаемые результаты")
    cost: Optional[str] = Field(default=None, description="Стоимость (если есть)")
    required: bool = Field(default=False, description="Обязательно к выполнению")


class GapItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(description="Название gap (навык/опыт/уровень)")
    kind: Literal["skill", "experience", "level"] = Field(description="Тип gap")
    priority: int = Field(ge=1, le=5, description="Приоритет (1=высокий)")
    prerequisites: List[str] = Field(default_factory=list, description="Имена gap, которые должны быть раньше")
    recommendations: List[RecommendationItem] = Field(default_factory=list, description="Рекомендации для закрытия gap")
    rationale: Optional[str] = Field(default=None, description="Почему этот gap важен")

    def total_hours(self) -> int:
        total = 0
        for r in self.recommendations:
            if r.duration_hours is not None:
                total += r.duration_hours
        return total


class GapGroup(BaseModel):
    model_config = ConfigDict(extra="forbid")
    group_id: int = Field(description="Порядковый номер группы")
    title: str = Field(description="Название группы")
    estimated_months: int = Field(ge=1, le=12, description="Оценка длительности группы (мес.)")
    hours_per_week: int = Field(description="Нагрузка в часах/неделю")
    items: List[GapItem] = Field(description="Gap в группе")
    notes: Optional[str] = Field(default=None, description="Комментарий по группе")


class TrajectoryBuildRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str = Field(description="Идентификатор сессии")
    weekly_hours: int = Field(default=8, ge=2, le=60, description="Доступные часы в неделю")
    total_months: int = Field(default=12, ge=1, le=36, description="Желаемый горизонт (мес.)")
    target_positions_limit: int = Field(default=5, ge=1, le=20, description="Размер итогового списка вакансий")
    current_positions_limit: int = Field(default=5, ge=1, le=20, description="Размер стартового списка вакансий")


class TrajectoryResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str = Field(description="Идентификатор сессии")
    current_positions: List[MatchedVacancy] = Field(default_factory=list, description="Доступные сейчас вакансии")
    groups: List[GapGroup] = Field(default_factory=list, description="Группы gap для закрытия")
    future_positions: List[MatchedVacancy] = Field(default_factory=list, description="Целевые вакансии")


