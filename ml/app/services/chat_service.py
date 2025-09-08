from __future__ import annotations

import json
from datetime import datetime
from typing import List, Tuple

from app.models import Message, MessageRole, ChatResponse
from app.prompts import CHAT_SYSTEM_PROMPT
from app.services.yandex_sdk import run_structured_completion
from app.repos.chat_repos import SessionsRepository, MessagesRepository


class ChatService:
    def __init__(self) -> None:
        self._system_prompt = CHAT_SYSTEM_PROMPT

    def build_messages_payload(self, chat_messages: List[dict]) -> List[dict]:
        messages: List[dict] = [{"role": "system", "text": self._system_prompt}]
        messages.extend([{"role": m["role"], "text": m["content"]} for m in chat_messages])
        return messages

    def get_response_schema(self) -> dict:
        return {
            "title": "User Profile",
            "description": "Схема для профессионального профиля пользователя.",
            "type": "object",
            "properties": {
                "answer_to_user2": {"title": "Ответ юзеру", "type": "string", "description": "Ответ юзеру"},
                "done": {"title": "Done", "type": "boolean", "description": "Вся ли нужная информация собрана"},
            },
            "required": ["answer_to_user2", "done"],
        }

    def parse_model_output(self, raw: str) -> Tuple[str, bool]:
        try:
            data = json.loads(raw)
        except Exception:
            return "", False
        reply_text = data.get("answer_to_user2", "")
        done = bool(data.get("done", False))
        return reply_text, done

    async def generate_reply(
        self,
        session_id: str,
        text: str,
        sessions_repo: SessionsRepository,
        messages_repo: MessagesRepository,
    ) -> ChatResponse:
        print(f"DEBUG: generate_reply called with session_id={session_id}, text='{text}'")
        session = await sessions_repo.find_by_id(session_id)
        print(f"DEBUG: session found: {session is not None}")
        if not session:
            raise ValueError("Session not found")

        # persist user message
        now = datetime.utcnow().isoformat()
        user_msg = Message(
            message_id=now + ":user",
            session_id=session_id,
            role=MessageRole.user,
            content=text,
            created_at=now,
            tokens=None,
        )
        await messages_repo.insert_one(user_msg.model_dump())

        # build last K
        last_msgs = await messages_repo.list_by_session(session_id, limit=40)
        messages = self.build_messages_payload(last_msgs)
        
        # Debug logging
        print(f"DEBUG: last_msgs count: {len(last_msgs)}")
        print(f"DEBUG: messages to YandexGPT: {messages}")
        
        raw = run_structured_completion(messages, self.get_response_schema())
        reply_text, done = self.parse_model_output(raw)

        assistant_msg = Message(
            message_id=now + ":assistant",
            session_id=session_id,
            role=MessageRole.assistant,
            content=reply_text,
            created_at=now,
            tokens=None,
            done=done,
        )
        await messages_repo.insert_one(assistant_msg.model_dump())

        return ChatResponse(session_id=session_id, reply=reply_text, done=done)


