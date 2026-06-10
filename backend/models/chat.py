from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    session_id: str


class ChatSessionRequest(BaseModel):
    session_id: str