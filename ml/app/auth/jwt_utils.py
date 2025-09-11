from __future__ import annotations

from typing import Optional

from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config import get_settings


def decode_jwt_token(token: str) -> Optional[dict]:
    """Decode JWT token and return payload."""
    settings = get_settings()
    
    if not settings.backend_jwt_secret:
        return None
    
    try:
        payload = jwt.decode(
            token, 
            settings.backend_jwt_secret, 
            algorithms=[settings.backend_jwt_algorithm]
        )
        return payload
    except JWTError:
        return None


def get_user_id_from_token(authorization: str) -> Optional[str]:
    """Extract user_id from Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    
    token = authorization.split(" ")[1]
    payload = decode_jwt_token(token)
    
    if payload:
        return payload.get("sub")  # JWT subject is typically the user_id
    
    return None
