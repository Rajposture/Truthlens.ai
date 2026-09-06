"""
Tiny, dependency-free persistence layer.

TruthLens intentionally avoids a database server (Postgres, etc.) so that it
can be deployed in minutes with zero provisioning. Everything is stored as
JSON on local disk, guarded by a lock so concurrent requests never corrupt a
file. Writes are atomic (write to a temp file, then replace) so a crash
mid-write can never leave a half-written file behind.

This is a deliberate, honest trade-off: it is fast to run and fast to
deploy, but on most hosts (Render, Railway free/hobby tiers) the disk is
wiped on redeploy. If you outgrow that, swap `JSONStore` for a real database
without touching any calling code — every method here has a narrow,
storage-agnostic signature.
"""
from __future__ import annotations

import json
import os
import tempfile
import threading
from pathlib import Path
from typing import Any

_lock = threading.RLock()


class JSONStore:
    """Reads/writes a single JSON file safely."""

    def __init__(self, path: Path, default: Any):
        self.path = path
        self._default = default
        if not self.path.exists():
            self.write(default)

    def read(self) -> Any:
        with _lock:
            try:
                with open(self.path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except (FileNotFoundError, json.JSONDecodeError):
                return self._default

    def write(self, data: Any) -> None:
        with _lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            fd, tmp_path = tempfile.mkstemp(
                dir=str(self.path.parent), prefix=".tmp-", suffix=".json"
            )
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                os.replace(tmp_path, self.path)
            finally:
                if os.path.exists(tmp_path):
                    os.remove(tmp_path)
