from pydantic import BaseModel


class UserCreate(BaseModel):

    clerk_id: str
    email: str