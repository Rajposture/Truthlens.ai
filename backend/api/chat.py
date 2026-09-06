from fastapi import APIRouter, Request

from backend.models.chat import (
    ChatRequest,
    ChatSessionRequest,
)

from backend.services.chat_service import (
    ChatService,
)

from backend.services.chat_session_service import (
    ChatSessionService,
)


router = APIRouter()


# ============================================================
# CHAT
# ============================================================

@router.post("/chat")
def chat(
    request: Request,
    payload: ChatRequest,
):
    return ChatService.chat(
        message=payload.message,
        session_id=payload.session_id,
    )


# ============================================================
# CLEAR CURRENT SESSION HISTORY
# ============================================================

@router.delete("/chat/history")
def clear_history(
    payload: ChatSessionRequest,
):
    return ChatService.clear_memory(
        payload.session_id
    )


# ============================================================
# LIST CHAT SESSIONS
# ============================================================

@router.get("/chat/sessions")
def list_sessions():
    return ChatSessionService.list_sessions()


# ============================================================
# GET CHAT HISTORY
# ============================================================

@router.get("/chat/history/{session_id}")
def get_history(
    session_id: str,
):
    return ChatSessionService.load_session(
        session_id
    )


# ============================================================
# DELETE CHAT HISTORY
# ============================================================

@router.delete("/chat/history/{session_id}")
def delete_history(
    session_id: str,
):
    return ChatSessionService.delete_session(
        session_id
    )