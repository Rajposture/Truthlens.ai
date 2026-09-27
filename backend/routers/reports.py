"""Reports = a read view over the same verification history.

Kept as its own router (rather than folding into history.py) because the
frontend's Reports page and History page are separate UX surfaces and may
diverge later (e.g. reports gaining PDF export, filters, etc.).
"""
from __future__ import annotations

from fastapi import APIRouter

from schemas import VerdictResponse
from services.history import history_service

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("", response_model=list[VerdictResponse])
def list_reports(limit: int = 200) -> list[dict]:
    return history_service.list(limit=limit)
