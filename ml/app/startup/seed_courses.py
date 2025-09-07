from __future__ import annotations

import os
from typing import Any

import polars as pl

from app.db.mongo import get_db


PARQUET_PATH = os.environ.get("COURSES_PARQUET_PATH", "data/courses.parquet")


async def seed_courses_if_needed() -> None:
    if not os.path.exists(PARQUET_PATH):
        return

    df = pl.read_parquet(PARQUET_PATH)
    required_cols: dict[str, Any] = {
        "idx": pl.UInt32,  # добавим по порядку, если нет
        "Course Name": pl.Utf8,
        "University": pl.Utf8,
        "Difficulty Level": pl.Utf8,
        "Course Rating": pl.Utf8,
        "Course URL": pl.Utf8,
        "Course Description": pl.Utf8,
        "Skills": pl.Utf8,
        "summary": pl.Utf8,
    }

    if "idx" not in df.columns:
        df = df.with_row_count("idx", offset=1)
    for col, dtype in required_cols.items():
        if col not in df.columns:
            df = df.with_columns(pl.lit(None).cast(dtype).alias(col))
        else:
            df = df.with_columns(pl.col(col).cast(dtype, strict=False))

    df = df.select(list(required_cols.keys()))

    db = await get_db()
    coll = db["courses"]
    await coll.create_index("idx")

    existing = set()
    async for doc in coll.find({}, {"idx": 1}):
        if "idx" in doc:
            existing.add(int(doc["idx"]))

    to_insert = [
        {k: (None if v == "" else v) for k, v in row.items()}
        for row in df.to_dicts()
        if int(row.get("idx", -1)) not in existing
    ]
    if to_insert:
        await coll.insert_many(to_insert)


