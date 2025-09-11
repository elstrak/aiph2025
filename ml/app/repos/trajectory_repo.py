from __future__ import annotations

from typing import Any, Optional, List

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.db.mongo import sanitize_mongo_doc, sanitize_many


class TrajectoryRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["trajectories"]

    async def get_by_session(self, session_id: str) -> Optional[dict[str, Any]]:
        doc = await self._coll.find_one({"session_id": session_id})
        return sanitize_mongo_doc(doc)

    async def upsert(self, session_id: str, trajectory: dict[str, Any], user_id: str = None) -> None:
        trajectory_data = {"session_id": session_id, **trajectory}
        if user_id:
            trajectory_data["user_id"] = user_id
        await self._coll.update_one(
            {"session_id": session_id},
            {"$set": trajectory_data},
            upsert=True,
        )

    async def list_by_user(self, user_id: str) -> List[dict[str, Any]]:
        docs = await self._coll.find({"user_id": user_id}).sort("created_at", -1).to_list(None)
        return sanitize_many(docs)


