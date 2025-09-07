from __future__ import annotations

from enum import Enum
from typing import Literal, Optional, Dict, Any, List

from pydantic import BaseModel, ConfigDict, Field


class MessageRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class Message(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message_id: str
    session_id: str
    role: MessageRole
    content: str
    created_at: str
    tokens: Optional[int] = None
    done: Optional[bool] = None


class SessionState(BaseModel):
    model_config = ConfigDict(extra="forbid")
    last_question_type: Optional[
        Literal["experience", "skills", "education", "goals", "preferences", "summary", "generic"]
    ] = None
    last_updated_at: str


class Session(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str
    user_id: str
    state: SessionState


class CreateSessionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: Optional[str] = None


class CreateSessionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str


class GetSessionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session: Session
    messages: list[Message]


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str
    reply: str
    done: bool


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    text: str


class HealthResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["ok"]
    time: str


class CourseItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: Optional[str] = None
    provider: Optional[str] = None
    year: Optional[int] = None
    skills_gained: List[str] = []


class ResumeItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    company: Optional[str] = Field(default=None, description="Компания, в которой работал пользователь.")
    title: Optional[str] = Field(default=None, description="Должность пользователя.")
    start_date: Optional[str] = None
    end_date: Optional[str] = Field(default=None, description="Дата окончания работы пользователя.")
    tasks: List[str] = Field(default_factory=list, description="Задачи, которые выполнялись на работе.")
    achievements: List[str] = Field(default_factory=list, description="Достижения на работе.")
    tech_stack: List[str] = Field(default_factory=list, description="Технологии на конкретной работе.")
    tools: List[str] = Field(default_factory=list, description="Инструменты на конкретной работе.")


class ProfessionalContext(BaseModel):
    model_config = ConfigDict(extra="forbid")
    professional_field: Optional[str] = Field(default=None, description="Профессиональная область (например, ML)")
    specialization: Optional[str] = Field(default=None, description="Специализация пользователя.")
    professional_role: Optional[str] = Field(default=None, description="Профессиональная роль пользователя.")


class Skills(BaseModel):
    model_config = ConfigDict(extra="forbid")
    hard_skills: List[str] = Field(default_factory=list, description="Hard skills из профессиональной деятельности.")
    soft_skills: List[str] = Field(default_factory=list, description="Soft skills из профессиональной деятельности.")
    tools: List[str] = Field(default_factory=list, description="Инструменты из профессиональной деятельности.")
    tech_stack: List[str] = Field(default_factory=list, description="Стек технологий из профессиональной деятельности.")
    courses: List[CourseItem] = Field(default_factory=list, description="Курсы и полученные навыки.")


class SalaryExpectation(BaseModel):
    model_config = ConfigDict(extra="forbid")
    currency: Optional[str] = Field(default=None, description="Валюта.")
    gross: Optional[bool] = Field(default=None, description="До вычета налогов.")
    min: Optional[int] = Field(default=None, description="Мин.")
    max: Optional[int] = Field(default=None, description="Макс.")


class Goals(BaseModel):
    model_config = ConfigDict(extra="forbid")
    target_field: Optional[str] = Field(default=None, description="Целевая область пользователя.")
    target_specialization: Optional[str] = Field(default=None, description="Целевая специализация пользователя.")
    desired_activities: List[str] = Field(default_factory=list)
    desired_role: Optional[str] = Field(default=None, description="Желаемая роль пользователя.")
    desired_level: Optional[str] = Field(default=None, description="Желаемый уровень (junior/middle/senior/lead).")
    salary_expectation: Optional[SalaryExpectation] = None


class Preferences(BaseModel):
    model_config = ConfigDict(extra="forbid")
    work_format: Optional[Literal["Remote", "Office", "Hybrid"]] = None
    location: List[str] = Field(default_factory=list, description="Город работы")


class UserProfile(BaseModel):
    model_config = ConfigDict(extra="forbid")
    achievements: List[str] = Field(default_factory=list, description="Глобальные достижения пользователя.")
    professional_context: Optional[ProfessionalContext] = Field(default=None, description="Профессиональный контекст пользователя.")
    resume: List[ResumeItem] = Field(default_factory=list, description="Опыт работы из резюме.")
    skills: Optional[Skills] = Field(default=None, description="Навыки и образование пользователя.")
    goals: Optional[Goals] = Field(default=None, description="Карьерные цели пользователя.")
    preferences: Optional[Preferences] = Field(default=None, description="Предпочтения пользователя.")


class ProfileResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str
    profile: UserProfile
