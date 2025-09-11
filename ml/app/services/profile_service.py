from __future__ import annotations

import json
from typing import List
from pypdf import PdfReader

from app.repos.chat_repos import SessionsRepository, MessagesRepository
from app.services.yandex_sdk import run_structured_completion
from app.prompts import PROFILE_SYSTEM_PROMPT


class ProfileService:
    def __init__(self) -> None:
        self._system_prompt = PROFILE_SYSTEM_PROMPT

    def get_profile_schema(self) -> dict:
        return {
            "json_schema": {
                "title": "User Profile",
                "type": "object",
                "description": "Схема для профессионального профиля пользователя.",
                "properties": {
                    "achievements": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Глобальные достижения пользователя.",
                    },
                    "professional_context": {
                        "title": "Professional Context",
                        "type": "object",
                        "description": "Профессиональный контекст пользователя.",
                        "properties": {
                            "professional_field": {"title": "Professional Field", "type": "string", "description": "Профессиональная область (например, ML)"},
                            "specialization": {"title": "Specialization", "type": "string", "description": "Специализация пользователя."},
                            "professional_role": {"title": "Professional Role", "type": "string", "description": "Профессиональная роль пользователя."},
                        },
                    },
                    "resume": {
                        "title": "Resume",
                        "type": "array",
                        "description": "Опыт работы из резюме.",
                        "items": {
                            "type": "object",
                            "properties": {
                                "company": {"type": "string", "description": "Компания, в которой работал пользователь."},
                                "title": {"type": "string", "description": "Должность пользователя."},
                                "start_date": {"type": "string"},
                                "end_date": {"type": ["string", "null"], "description": "Дата окончания работы пользователя."},
                                "tasks": {"type": "array", "items": {"type": "string"}, "description": "Задачи, которые выполнялись на работе."},
                                "achievements": {"type": "array", "items": {"type": "string"}, "description": "Достижения на работе."},
                                "tech_stack": {
                                    "description": "Технологии, используемые на конкретной на этой работе. Не пиши про технологии которые не были указаны конкреттно для данной работы.",
                                    "type": "array",
                                    "items": {"type": "string"}
                                },
                                "tools": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Инструменты, используемые на конкретной на этой работе. Не пиши про инструменты которые не были указаны конкреттно для данной работы.",
                                },
                            },
                        },
                    },
                    "skills": {
                        "title": "Skills",
                        "type": "object",
                        "description": "Навыки и образование пользователя.",
                        "properties": {
                            "hard_skills": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "title": "Hard Skill",
                                },
                                "description": "Hard skills, используемые где-либо в профессиональной деятельности. Сюда пиши про все hard skills, которые были указаны в резюме.",
                            },
                            "soft_skills": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "title": "Soft Skill",
                                },
                                "description": "Soft skills, используемые где-либо в профессиональной деятельности. Сюда пиши про все soft skills, которые были указаны в резюме.",
                            },
                            "tools": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "title": "Tool",
                                },
                                "description": "Инструменты, используемые где-либо в профессиональной деятельности. Сюда пиши про все инструменты, которые были указаны в резюме.",
                            },
                            "tech_stack": {
                                "type": "array",
                                "items": {
                                    "type": "string",
                                    "title": "Tech Stack",
                                },
                                "description": "Технологии, используемые где-либо в профессиональной деятельности. Сюда пиши про вес стэк, которые были указаны в резюме.",
                            },
                            "courses": {
                                "type": "array",
                                "title": "Courses",
                                "description": "Курсы и навыки с курсов",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "title": {"type": "string"},
                                        "provider": {"type": "string"},
                                        "year": {"type": "integer"},
                                        "skills_gained": {"type": "array", "items": {"type": "string"}},
                                    },
                                },
                            },
                        },
                    },
                    "goals": {
                        "title": "Goals",
                        "type": "object",
                        "description": "Карьерные цели пользователя.",
                        "properties": {
                            "target_field": {"title": "Target Field", "type": "string", "description": "Целевая область пользователя."},
                            "target_specialization": {"title": "Target Specialization", "type": "string", "description": "Целевая специализация пользователя."},
                            "desired_activities": {"type": "array", "items": {"type": "string"}},
                            "desired_role": {"title": "Desired Role", "type": "string", "description": "Желаемая роль пользователя."},
                            "desired_level": {"title": "Desired Level", "type": "string", "description": "Желаемый уровень (junior/middle/senior/lead)."},
                            "salary_expectation": {"type": "object", "properties": {"currency": {"title": "Currency", "type": "string", "description": "Валюта."}, "gross": {"title": "Gross", "type": "boolean", "description": "До вычета налогов."}, "min": {"title": "Min", "type": "integer", "description": "Мин."}, "max": {"title": "Max", "type": "integer", "description": "Макс."}}},
                        },
                    },
                    "preferences": {
                        "title": "Preferences",
                        "type": "object",
                        "description": "Предпочтения пользователя.",
                        "properties": {
                            "work_format": {"enum": ["Remote", "Office", "Hybrid"]},
                            "location": {"type": "array", "items": {"type": "string"}, "description": "Город работы"},
                        },
                    },
                },
            }
        }['json_schema']

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        reader = PdfReader(io.BytesIO(file_bytes))  # type: ignore[name-defined]
        texts: list[str] = []
        for page in reader.pages:
            texts.append(page.extract_text() or "")
        return "\n".join(texts)

    async def build_profile(self, session_id: str, sessions_repo: SessionsRepository, messages_repo: MessagesRepository) -> dict:
        session = await sessions_repo.find_by_id(session_id)
        if not session:
            raise ValueError("Session not found")

        last_msg = await messages_repo.find_last_assistant_message(session_id)
        if not last_msg or not last_msg.get("done"):
            raise ValueError("Interview not finished: last assistant message is not done")

        msgs = await messages_repo.list_by_session(session_id, limit=1000)
        chat_messages: List[dict] = [{"role": m["role"], "text": m["content"]} for m in msgs]
        messages = [{"role": "system", "text": self._system_prompt}] + chat_messages
        raw = run_structured_completion(messages, self.get_profile_schema(), max_tokens=8000)
        try:
            data = json.loads(raw)
        except Exception as exc:  # surfacing
            raise ValueError("Failed to parse structured profile JSON") from exc
        return {"session_id": session_id, "profile": data}


