from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Header

from app.db.mongo import get_db
from app.models.trajectory_models import TrajectoryBuildRequest, TrajectoryResponse
from app.repos.chat_repos import SessionsRepository, MessagesRepository
from app.repos.match_repos import VacanciesRepository, CoursesRepository
from app.repos.trajectory_repo import TrajectoryRepository
from app.services.trajectory_service import TrajectoryService


router = APIRouter()


def get_traj_service() -> TrajectoryService:
    return TrajectoryService()


async def get_sessions_repo(db=Depends(get_db)) -> SessionsRepository:  # noqa: ANN001
    return SessionsRepository(db)


async def get_messages_repo(db=Depends(get_db)) -> MessagesRepository:  # noqa: ANN001
    return MessagesRepository(db)


async def get_vacancies_repo(db=Depends(get_db)) -> VacanciesRepository:  # noqa: ANN001
    return VacanciesRepository(db)


async def get_courses_repo(db=Depends(get_db)) -> CoursesRepository:  # noqa: ANN001
    return CoursesRepository(db)


async def get_traj_repo(db=Depends(get_db)) -> TrajectoryRepository:  # noqa: ANN001
    return TrajectoryRepository(db)


@router.post("/build", response_model=TrajectoryResponse)
async def build_trajectory(
    payload: TrajectoryBuildRequest,
    authorization: str = Header(None),
    service: TrajectoryService = Depends(get_traj_service),
    sessions_repo: SessionsRepository = Depends(get_sessions_repo),
    messages_repo: MessagesRepository = Depends(get_messages_repo),
    vacancies_repo: VacanciesRepository = Depends(get_vacancies_repo),
    courses_repo: CoursesRepository = Depends(get_courses_repo),
    traj_repo: TrajectoryRepository = Depends(get_traj_repo),
) -> TrajectoryResponse:
    try:
        return await service.build(payload, sessions_repo, messages_repo, vacancies_repo, courses_repo, traj_repo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trajectory build failed: {e}")


@router.get("/user/{user_id}", response_model=List[TrajectoryResponse])
async def get_user_trajectories(
    user_id: str,
    traj_repo: TrajectoryRepository = Depends(get_traj_repo),
) -> List[TrajectoryResponse]:
    try:
        trajectories = await traj_repo.list_by_user(user_id)
        return [TrajectoryResponse.model_validate(traj) for traj in trajectories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load trajectories: {e}")


