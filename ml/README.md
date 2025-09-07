# Career Coach Interview Module

FastAPI service for conversational interview to collect user career profile data. Orchestrated with LangGraph, LLM via YandexGPT (LangChain), data stored in MongoDB. Managed with uv. Deployed via Docker Compose.

## Requirements
- Docker + Docker Compose
- YandexGPT credentials (`YANDEX_API_KEY` or `YANDEX_IAM_TOKEN`) and `YANDEX_FOLDER_ID`

## Quick start

1. Copy env example and fill values:
```bash
cp .env.example .env
```

2. Build and run:
```bash
docker compose up --build
```

3. API: http://localhost:8000

### Local development (without Docker)
```bash
uv sync
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Services
- api: FastAPI app, integrates YandexGPT, stores data in MongoDB
- mongo: MongoDB database with volume persistence

## Environment
See `.env.example`.


