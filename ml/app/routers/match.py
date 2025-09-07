from __future__ import annotations

from fastapi import APIRouter, HTTPException, Depends

from app.db.mongo import get_db
from app.services.match_service import MatchService
from app.repos.match_repos import VacanciesRepository, CoursesRepository
from app.models.match_models import (
    MatchVacanciesRequest,
    MatchVacanciesResponse,
    MatchCoursesRequest,
    MatchCoursesResponse,
    MatchFutureRequest,
)


router = APIRouter()


def get_match_service() -> MatchService:
    return MatchService()


async def get_vacancies_repo(db=Depends(get_db)) -> VacanciesRepository:  # noqa: ANN001
    return VacanciesRepository(db)


async def get_courses_repo(db=Depends(get_db)) -> CoursesRepository:  # noqa: ANN001
    return CoursesRepository(db)


@router.post("/top", response_model=MatchVacanciesResponse)
async def match_resume(
    req: MatchVacanciesRequest,
    service: MatchService = Depends(get_match_service),
    vac_repo: VacanciesRepository = Depends(get_vacancies_repo),
) -> MatchVacanciesResponse:
    try:
        return await service.match_vacancies(req, vac_repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {e}")

@router.post("/courses", response_model=MatchCoursesResponse)
async def match_courses(
    req: MatchCoursesRequest,
    service: MatchService = Depends(get_match_service),
    course_repo: CoursesRepository = Depends(get_courses_repo),
) -> MatchCoursesResponse:
    try:
        return await service.match_courses(req, course_repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Courses matching failed: {e}")


@router.post("/future", response_model=MatchVacanciesResponse)
async def match_future(
    req: MatchFutureRequest,
    service: MatchService = Depends(get_match_service),
    vac_repo: VacanciesRepository = Depends(get_vacancies_repo),
) -> MatchVacanciesResponse:
    try:
        return await service.match_future(req, vac_repo)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {e}")
