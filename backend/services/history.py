"""Stores past verification results so the /history page has something to show."""
from __future__ import annotations

from config import settings
from schemas import VerdictResponse
from storage import JSONStore

MAX_HISTORY_ITEMS = 300


class HistoryService:
    def __init__(self) -> None:
        self._store = JSONStore(settings.data_dir / "history.json", default=[])

    def add(self, result: VerdictResponse) -> None:
        items = self._store.read()
        items.insert(0, result.model_dump())
        self._store.write(items[:MAX_HISTORY_ITEMS])

    def list(self, limit: int = 100) -> list[dict]:
        return self._store.read()[:limit]

    def clear(self) -> None:
        self._store.write([])


history_service = HistoryService()
