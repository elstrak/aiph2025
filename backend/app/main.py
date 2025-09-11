from contextlib import asynccontextmanager
import sys
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import ORJSONResponse

from .config import get_settings
from .db.mongo import connect_to_mongo, close_mongo_connection
from .routers import auth, profile


logging.basicConfig(level=logging.INFO, stream=sys.stdout)


@asynccontextmanager
async def lifespan(app: FastAPI):  # noqa: ANN001
    await connect_to_mongo()
    try:
        yield
    finally:
        await close_mongo_connection()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Career Auth API",
        default_response_class=ORJSONResponse,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(profile.router, prefix="/profile", tags=["profile"])
    return app


app = create_app()


