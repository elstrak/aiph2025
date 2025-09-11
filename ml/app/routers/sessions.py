from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Header

from app.db.mongo import get_db, sanitize_mongo_doc, sanitize_many
from app.models import (
    CreateSessionRequest,
    CreateSessionResponse,
    GetSessionResponse,
    Message,
    Session,
    SessionState,
)
from app.auth.jwt_utils import get_user_id_from_token


router = APIRouter()


@router.post("", response_model=CreateSessionResponse)
async def create_session(
    payload: CreateSessionRequest | None = None,
    authorization: str = Header(None)
) -> CreateSessionResponse:
    db = await get_db()
    now = datetime.utcnow().isoformat()
    
    # Try to get user_id from JWT token first, then from payload, then generate new
    user_id = None
    if authorization:
        user_id = get_user_id_from_token(authorization)
    
    if not user_id and payload and payload.user_id:
        user_id = payload.user_id
    
    if not user_id:
        user_id = str(uuid4())
    
    session = Session(
        session_id=str(uuid4()),
        user_id=user_id,
        state=SessionState(
            last_question_type=None,
            last_updated_at=now,
        ),
    )
    await db["sessions"].insert_one(session.model_dump())

    return CreateSessionResponse(session_id=session.session_id)


@router.get("/{session_id}", response_model=GetSessionResponse)
async def get_session(session_id: str) -> GetSessionResponse:
    db = await get_db()
    session_doc = sanitize_mongo_doc(await db["sessions"].find_one({"session_id": session_id}))
    if not session_doc:
        raise HTTPException(status_code=404, detail="Session not found")
    messages_docs = sanitize_many([m async for m in db["messages"].find({"session_id": session_id}).sort("created_at", 1).limit(50)])
    session = Session.model_validate(session_doc)
    messages = [Message.model_validate(md) for md in messages_docs]
    return GetSessionResponse(session=session, messages=messages)


