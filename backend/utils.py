from __future__ import annotations

import re
from datetime import datetime, timezone


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_id(raw: str, fallback: str = "default", max_len: int = 128) -> str:
    """Sanitize a client-supplied id so it can never escape its data directory."""
    cleaned = re.sub(r"[^a-zA-Z0-9_-]", "", raw or "")[:max_len]
    return cleaned or fallback
