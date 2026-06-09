from fastapi import APIRouter

from Database.crud import (
    create_user
)

from Database.schemas import (
    UserCreate
)

router = APIRouter()


@router.post("/users")
def create_user_endpoint(
    payload: UserCreate
):

    return create_user(
        payload.dict()
    )