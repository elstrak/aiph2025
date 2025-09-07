# syntax=docker/dockerfile:1.7
FROM ghcr.io/astral-sh/uv:python3.12-bookworm

WORKDIR /app

# Copy project metadata and lockfile first for better caching
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-editable

# Copy only application source and data
COPY data/vacancies.parquet ./data/vacancies.parquet
COPY data/courses.parquet ./data/courses.parquet
COPY data/embeddings ./embeddings
COPY app ./app



CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


