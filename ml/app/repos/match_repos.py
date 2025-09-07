from __future__ import annotations

from typing import Any, Iterable, List

from motor.motor_asyncio import AsyncIOMotorDatabase
from app.db.mongo import sanitize_many


class VacanciesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["vacancies"]

    async def find_by_idx(self, idx_list: Iterable[int]) -> List[dict[str, Any]]:
        cur = self._coll.find({"idx": {"$in": list(map(int, idx_list))}})
        docs = [d async for d in cur]
        return sanitize_many(docs)


class CoursesRepository:
    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._coll = db["courses"]

    async def find_by_idx(self, idx_list: Iterable[int]) -> List[dict[str, Any]]:
        cur = self._coll.find({"idx": {"$in": list(map(int, idx_list))}})
        docs = [d async for d in cur]
        return sanitize_many(docs)


