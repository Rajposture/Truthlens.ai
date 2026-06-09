from fastapi import APIRouter

from models.chat import ChatRequest
from services.chat_service import ChatService

router = APIRouter()


@router.post("/chat")
def chat(
    request: ChatRequest
):

    return ChatService.chat(
        request.message
    )