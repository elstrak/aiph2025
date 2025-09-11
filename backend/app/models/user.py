from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserIn(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserDB(BaseModel):
    id: str
    email: EmailStr
    password_hash: str
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = Field(default="bearer")


class Profile(BaseModel):
    full_name: Optional[str] = None
    current_position: Optional[str] = None
    location: Optional[str] = None
    about: Optional[str] = None
    skills: list[str] = []
    email: Optional[EmailStr] = None


