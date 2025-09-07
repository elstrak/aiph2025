from __future__ import annotations

from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongo import sanitize_mongo_doc


class TrajectoryRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["trajectories"]

    async def get_by_session(self, session_id: str) -> Optional[dict[str, Any]]:
        doc = await self._coll.find_one({"session_id": session_id})
        return sanitize_mongo_doc(doc)

    async def upsert(self, session_id: str, trajectory: dict[str, Any]) -> None:
        await self._coll.update_one(
            {"session_id": session_id},
            {"$set": {"session_id": session_id, **trajectory}},
            upsert=True,
        )


