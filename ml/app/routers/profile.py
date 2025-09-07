from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.db.mongo import get_db
from app.models import ProfileResponse
from app.repos.chat_repos import SessionsRepository, MessagesRepository
from app.services.profile_service import ProfileService


router = APIRouter()


def get_profile_service() -> ProfileService:
    return ProfileService()


async def get_sessions_repo(db=Depends(get_db)) -> SessionsRepository:  # noqa: ANN001
    return SessionsRepository(db)


async def get_messages_repo(db=Depends(get_db)) -> MessagesRepository:  # noqa: ANN001
    return MessagesRepository(db)


@router.get("/{session_id}", response_model=ProfileResponse)
async def get_profile(
    session_id: str,
    service: ProfileService = Depends(get_profile_service),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    messages_repo: MessagesRepository = Depends(get_messages_repo),
) -> ProfileResponse:
    try:
        data = await service.build_profile(session_id, sessions_repo, messages_repo)
        return ProfileResponse(**data)
    except ValueError as e:
        msg = str(e)
        if "Session not found" in msg:
            raise HTTPException(status_code=404, detail=msg)
        raise HTTPException(status_code=400, detail=msg)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build profile: {e}")


