from __future__ import annotations

from typing import Any, Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import Settings

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def init_mongo(settings: Settings) -> None:
    global _client, _db
    if _client is not None:
        return
    _client = AsyncIOMotorClient(settings.mongo_uri)
    _db = _client[settings.mongo_db]


async def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB is not initialized")
    return _db


async def close_mongo() -> None:
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


async def ensure_indexes() -> None:
    db = await get_db()
    await db["sessions"].create_index("user_id")
    await db["profiles"].create_index("user_id")
    await db["messages"].create_index([("session_id", 1), ("created_at", 1)])


def sanitize_mongo_doc(doc: Optional[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if doc is None:
        return None
    if "_id" in doc:
        doc = {k: v for k, v in doc.items() if k != "_id"}
    return doc


def sanitize_many(docs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [sanitize_mongo_doc(d) or {} for d in docs]


