from fastapi import APIRouter

from schemas import HistoryClearResponse, VerdictResponse
from services.history import history_service

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("", response_model=list[VerdictResponse])
def list_history(limit: int = 100) -> list[dict]:
    return history_service.list(limit=limit)


@router.delete("", response_model=HistoryClearResponse)
def clear_history() -> dict:
    history_service.clear()
    return {"status": "success", "message": "History cleared."}
