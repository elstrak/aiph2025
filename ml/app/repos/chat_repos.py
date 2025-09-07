from __future__ import annotations

from typing import Any, List, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongo import sanitize_mongo_doc, sanitize_many


class SessionsRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["sessions"]

    async def find_by_id(self, session_id: str) -> Optional[dict[str, Any]]:
        doc = await self._coll.find_one({"session_id": session_id})
        return sanitize_mongo_doc(doc)


class MessagesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["messages"]

    async def list_by_session(self, session_id: str, limit: int = 40) -> List[dict[str, Any]]:
        cursor = self._coll.find({"session_id": session_id}).sort("created_at", 1).limit(int(limit))
        docs = [d async for d in cursor]
        return sanitize_many(docs)

    async def insert_one(self, message: dict[str, Any]) -> None:
        await self._coll.insert_one(message)

    async def find_last_assistant_message(self, session_id: str) -> Optional[dict[str, Any]]:
        doc = await self._coll.find_one({"session_id": session_id, "role": "assistant"}, sort=[("created_at", -1)])
        return sanitize_mongo_doc(doc)


