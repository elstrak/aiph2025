from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class MatchedVacancy(BaseModel):
    model_config = ConfigDict(extra="forbid")
    idx: int
    title: Optional[str] = Field(default="")
    company: Optional[str] = Field(default="")
    location: Optional[str] = Field(default="")
    salary: Optional[str] = Field(default="")
    experience: Optional[str] = Field(default="")
    description: Optional[str] = Field(default="")

class MatchVacanciesResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    top_idx: List[int]
    stage1: List[int]
    result: List[MatchedVacancy]


class MatchedCourse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    idx: int
    name: Optional[str] = Field(default="")
    university: Optional[str] = Field(default="")
    level: Optional[str] = Field(default="")
    rating: Optional[str] = Field(default="")
    url: Optional[str] = Field(default="")


class MatchCoursesResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    top_idx: List[int]
    stage1: List[int]
    result: List[MatchedCourse]


# Requests


class MatchVacanciesRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    resume: str
    k_faiss: int = Field(default=100, ge=1, le=2000)
    k_stage1: int = Field(default=20, ge=1, le=200)
    k_stage2: int = Field(default=5, ge=1, le=100)


class MatchCoursesRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    desired_skills: str
    field: str | None = None
    specialization: str | None = None
    k_faiss: int = Field(default=100, ge=1, le=2000)
    k_stage1: int = Field(default=20, ge=1, le=200)
    k_stage2: int = Field(default=5, ge=1, le=100)


class MatchFutureRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    field: str
    specialization: str
    activities: str
    desired_role: str
    desired_level: Optional[str] = None
    salary_expectation: str
    additional_info: str | None = None
    k_faiss: int = Field(default=100, ge=1, le=2000)
    k_stage1: int = Field(default=20, ge=1, le=200)
    k_stage2: int = Field(default=5, ge=1, le=100)
