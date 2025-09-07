from contextlib import asynccontextmanager
import logging
import sys
from datetime import datetime
from fastapi import FastAPI
from fastapi.responses import ORJSONResponse

from app.config import Settings, get_settings
from app.db.mongo import init_mongo, close_mongo, ensure_indexes
from app.routers.sessions import router as sessions_router
from app.routers.chat import router as chat_router
from app.routers.profile import router as profile_router
from app.routers.match import router as match_router
from app.routers.trajectory import router as trajectory_router
from app.startup.seed_vacancies import seed_vacancies_if_needed
from app.startup.seed_courses import seed_courses_if_needed
from app.startup.load_embeddings import build_faiss
from app.models import HealthResponse
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    stream=sys.stdout,
)



@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ANN001
    settings: Settings = get_settings()
    await init_mongo(settings)
    await ensure_indexes()
    await seed_vacancies_if_needed()
    await seed_courses_if_needed()
    build_faiss()

    try:
        yield
    finally:
        await close_mongo()


app = FastAPI(
    title="Career Coach Interview API",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", time=datetime.utcnow().isoformat())


app.include_router(sessions_router, prefix="/sessions", tags=["sessions"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(profile_router, prefix="/profile", tags=["profile"])
app.include_router(match_router, prefix="/match", tags=["match"])
app.include_router(trajectory_router, prefix="/trajectory", tags=["trajectory"])


