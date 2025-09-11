from fastapi import APIRouter, Depends
from bson import ObjectId
from ..auth.dependencies import get_current_user
from ..db.mongo import get_db
from ..models.user import Profile


router = APIRouter()


@router.get("/me", response_model=Profile)
async def get_me(db=Depends(get_db), user=Depends(get_current_user)) -> Profile:  # noqa: ANN001
    doc = await db.users.find_one({"_id": ObjectId(user["_id"])})
    prof = doc.get("profile") or {}
    # Fill from top-level if missing in profile
    if not prof.get("full_name") and doc.get("full_name"):
        prof["full_name"] = doc.get("full_name")
    if not prof.get("email") and doc.get("email"):
        prof["email"] = doc.get("email")
    return Profile(**prof)


@router.put("/me", response_model=Profile)
async def update_me(payload: Profile, db=Depends(get_db), user=Depends(get_current_user)) -> Profile:  # noqa: ANN001
    await db.users.update_one({"_id": ObjectId(user["_id"])}, {"$set": {"profile": payload.model_dump()}})
    return payload


