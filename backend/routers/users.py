from fastapi import APIRouter

from schemas import UserCreate, UserInfo
from services.users import users_service

router = APIRouter(prefix="/api", tags=["Users"])


@router.post("/users", response_model=UserInfo)
def sync_user(payload: UserCreate) -> UserInfo:
    return users_service.upsert(payload)
