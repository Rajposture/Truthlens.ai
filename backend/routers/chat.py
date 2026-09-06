from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from config import settings
from rate_limit import limiter
from schemas import ChatRequest, ChatResponse, ChatSessionSummary
from services.chat import chat_service

router = APIRouter(prefix="/api", tags=["Chat"])


@router.post("/chat", response_model=ChatResponse)
@limiter.limit(settings.RATE_LIMIT_CHAT)
async def chat_endpoint(request: Request, payload: ChatRequest) -> ChatResponse:
    result = await chat_service.respond(payload.message, payload.session_id)
    return ChatResponse(**result)


@router.post("/chat/stream")
@limiter.limit(settings.RATE_LIMIT_CHAT)
async def chat_stream_endpoint(request: Request, payload: ChatRequest) -> StreamingResponse:
    generator = chat_service.respond_stream(payload.message, payload.session_id)
    return StreamingResponse(generator, media_type="text/plain; charset=utf-8")


@router.get("/chat/sessions", response_model=list[ChatSessionSummary])
def list_sessions() -> list[dict]:
    return chat_service.list_sessions()


@router.get("/chat/sessions/{session_id}")
def get_session(session_id: str) -> list[dict]:
    return chat_service.get_session(session_id)


@router.delete("/chat/sessions/{session_id}")
def delete_session(session_id: str) -> dict:
    chat_service.delete_session(session_id)
    return {"status": "success", "message": "Conversation deleted."}
