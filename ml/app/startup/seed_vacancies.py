from __future__ import annotations

import os
from typing import Any

import polars as pl

from app.db.mongo import get_db


PARQUET_PATH = os.environ.get("VACANCIES_PARQUET_PATH", "data/vacancies.parquet")


async def seed_vacancies_if_needed() -> None:
    if not os.path.exists(PARQUET_PATH):
        return

    df = pl.read_parquet(PARQUET_PATH)
    # Normalize schema and select required columns with types
    required_cols: dict[str, Any] = {
        "idx": pl.UInt32,
        "№": pl.Int64,
        "id": pl.Int64,
        "title": pl.Utf8,
        "salary": pl.Utf8,
        "experience": pl.Utf8,
        "job_type": pl.Utf8,
        "description": pl.Utf8,
        "key_skills": pl.Utf8,
        "company": pl.Utf8,
        "location": pl.Utf8,
        "date_of_post": pl.Utf8,
        "type": pl.Utf8,
    }

    # Ensure columns exist, fill missing
    for col, dtype in required_cols.items():
        if col not in df.columns:
            df = df.with_columns(pl.lit(None).cast(dtype).alias(col))
        else:
            df = df.with_columns(pl.col(col).cast(dtype, strict=False))

    df = df.select(list(required_cols.keys()))

    db = await get_db()
    coll = db["vacancies"]

    # Fetch existing idx set to avoid duplicates
    existing = set()
    async for doc in coll.find({}, {"idx": 1}):
        if "idx" in doc:
            existing.add(int(doc["idx"]))

    # Insert missing
    to_insert = [
        {k: (None if v == "" else v) for k, v in row.items()}
        for row in df.to_dicts()
        if int(row.get("idx", -1)) not in existing
    ]
    if to_insert:
        # create index on idx if missing
        await coll.create_index("idx")
        await coll.insert_many(to_insert)


