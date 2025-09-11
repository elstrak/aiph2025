from __future__ import annotations

from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    app_env: str = Field(default="development", alias="APP_ENV")
    app_host: str = Field(default="0.0.0.0", alias="APP_HOST")
    app_port: int = Field(default=8000, alias="APP_PORT")

    mongo_uri: str = Field(default="mongodb://mongo:27017", alias="MONGO_URI")
    mongo_db: str = Field(default="career_coach", alias="MONGO_DB")

    yandex_folder_id: str = Field(default="", alias="YANDEX_FOLDER_ID")
    yandex_api_key: str = Field(default="", alias="YANDEX_API_KEY")
    yandex_iam_token: str = Field(default="", alias="YANDEX_IAM_TOKEN")

    message_window_size: int = Field(default=12, alias="MESSAGE_WINDOW_SIZE")

    
    backend_jwt_secret: str = Field(default="", alias="BACKEND_JWT_SECRET")
    backend_jwt_algorithm: str = Field(default="HS256", alias="BACKEND_JWT_ALGORITHM")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]


