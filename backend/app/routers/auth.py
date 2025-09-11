from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from bson import ObjectId
from ..db.mongo import get_db
from ..models.user import UserIn, TokenResponse
from ..auth.security import hash_password, verify_password, create_access_token


router = APIRouter()


@router.post("/register", response_model=TokenResponse)
async def register(user: UserIn, db=Depends(get_db)) -> TokenResponse:  # noqa: ANN001
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    doc = {
        "email": user.email,
        "password_hash": hash_password(user.password),
        "full_name": user.full_name,
        "profile": {},
    }
    res = await db.users.insert_one(doc)
    token = create_access_token(str(res.inserted_id))
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), db=Depends(get_db)) -> TokenResponse:  # noqa: ANN001
    user = await db.users.find_one({"email": form.username})
    if not user or not verify_password(form.password, user.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    token = create_access_token(str(user["_id"]))
    return TokenResponse(access_token=token)


