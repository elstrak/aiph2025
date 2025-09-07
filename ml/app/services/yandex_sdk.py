
from __future__ import annotations

import numpy as np

from typing import Any, Dict, List

from yandex_cloud_ml_sdk import YCloudML

from app.config import get_settings


def _get_sdk() -> YCloudML:
    settings = get_settings()
    if not settings.yandex_folder_id:
        raise RuntimeError("YANDEX_FOLDER_ID is required")
    auth = settings.yandex_api_key or settings.yandex_iam_token
    if not auth:
        raise RuntimeError("YANDEX_API_KEY or YANDEX_IAM_TOKEN is required")
    return YCloudML(folder_id=settings.yandex_folder_id, auth=auth)


def run_structured_completion(
    messages: List[Dict[str, str]],
    json_schema: Dict[str, Any],
    model_name: str = "yandexgpt",
    model_version: str = "rc",
    max_tokens: int = 1000,
) -> str:
    sdk = _get_sdk()
    model = sdk.models.completions(model_name, model_version=model_version)
    model = model.configure(response_format={"json_schema": json_schema}, max_tokens=max_tokens)
    result = model.run(messages)
    return result[0].text


def run_text_completion(
    messages: List[Dict[str, str]],
    model_name: str = "yandexgpt",
    model_version: str = "rc",
) -> str:
    sdk = _get_sdk()
    model = sdk.models.completions(model_name, model_version=model_version)
    result = model.run(messages)
    return result[0].text


def get_embeddings_model(model_kind: str = "doc"):
    sdk = _get_sdk()
    return sdk.models.text_embeddings(model_kind)


def embed_text(text: str, model_kind: str = "query") -> np.ndarray:

    model = get_embeddings_model(model_kind)
    vec = model.run(text)
    return np.array(vec, dtype="float32")

