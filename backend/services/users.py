"""Minimal persistence for Clerk-authenticated users.

Keeps the same zero-provisioning philosophy as the rest of the backend
(storage.py's JSONStore) instead of pulling in a database server.
"""
from __future__ import annotations

from config import settings
from schemas import UserCreate, UserInfo
from storage import JSONStore
from utils import now_iso


class UsersService:
    def __init__(self) -> None:
        self._store = JSONStore(settings.data_dir / "users.json", default=[])

    def upsert(self, payload: UserCreate) -> UserInfo:
        users = self._store.read()
        existing = next((u for u in users if u["clerk_id"] == payload.clerk_id), None)
        if existing:
            existing["email"] = payload.email
            self._store.write(users)
            return UserInfo(**existing)

        record = UserInfo(clerk_id=payload.clerk_id, email=payload.email, created_at=now_iso())
        users.append(record.model_dump())
        self._store.write(users)
        return record


users_service = UsersService()
