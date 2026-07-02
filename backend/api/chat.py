from fastapi import (
APIRouter,
Request
)

from models.chat import (
ChatRequest,
ChatSessionRequest,
)

from services.chat_service import (
ChatService,
)

from services.chat_session_service import (
ChatSessionService,
)

router = APIRouter()

@router.post("/chat")
def chat(
    request: Request,
    payload: ChatRequest
):
    return ChatService.chat(
        message=payload.message,
        session_id=payload.session_id,
    )

@router.delete("/chat/history")
def clear_history(
    payload: ChatSessionRequest
):
    return ChatService.clear_memory(
        payload.session_id
    )

@router.get("/chat/sessions")
def list_sessions():
    return (
        ChatSessionService
        .list_sessions()
    )


@router.get(
    "/chat/history/{session_id}"
)
def get_history(
    session_id: str
):
    return (
        ChatSessionService
        .load_session(
            session_id
        )
    )


@router.delete(
    "/chat/history/{session_id}"
)
def delete_history(
    session_id: str
):
    return (
        ChatSessionService
        .delete_session(
            session_id
        )
    )

