"""
Lightweight retrieval engine for TruthLens.

The original project pulled in ChromaDB + sentence-transformers + torch to
do semantic search. That stack alone is well over a gigabyte of dependencies,
takes minutes to install, downloads model weights on first boot, and easily
exceeds the RAM of a free Render/Railway instance — the opposite of "fast to
deploy."

BM25 (a keyword/statistical ranking algorithm, the same family of algorithm
search engines used for decades before embeddings) needs no model weights,
no GPU, and no network call to index or search. It installs in seconds and
runs in milliseconds, which matters a lot for a tool whose whole pitch is
speed. It's a good trade for this app's scale of use (a curated knowledge
base + a handful of uploaded documents, not billions of vectors).

If you outgrow this, `search()` is the only method callers use — swap the
internals for pgvector/Pinecone/etc. without touching the routers/services.
"""
from __future__ import annotations

import json
import re
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from rank_bm25 import BM25Okapi

from config import settings
from storage import JSONStore

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


def chunk_text(text: str, size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks, snapping to whitespace boundaries."""
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []

    chunks: list[str] = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + size, length)

        if end < length:
            boundary = text.rfind(" ", start + int(size * 0.6), end)
            if boundary != -1:
                end = boundary

        piece = text[start:end].strip()
        if len(piece) >= 40:
            chunks.append(piece)

        if end >= length:
            break
        start = max(end - overlap, start + 1)

    return chunks


@dataclass
class Chunk:
    id: str
    doc_id: str
    source: str
    text: str

    @staticmethod
    def from_dict(d: dict) -> "Chunk":
        return Chunk(id=d["id"], doc_id=d["doc_id"], source=d["source"], text=d["text"])

    def to_dict(self) -> dict:
        return {"id": self.id, "doc_id": self.doc_id, "source": self.source, "text": self.text}


class KnowledgeBase:
    """In-memory BM25 index backed by a JSON file for persistence."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._store = JSONStore(settings.data_dir / "knowledge_chunks.json", default=[])
        self._chunks: list[Chunk] = [Chunk.from_dict(d) for d in self._store.read()]
        self._bm25: BM25Okapi | None = None
        self._rebuild_index()

        if not self._chunks:
            self._seed()

    # ------------------------------------------------------------------
    def _rebuild_index(self) -> None:
        if self._chunks:
            corpus = [tokenize(c.text) for c in self._chunks]
            self._bm25 = BM25Okapi(corpus)
        else:
            self._bm25 = None

    def _persist(self) -> None:
        self._store.write([c.to_dict() for c in self._chunks])

    def _seed(self) -> None:
        seed_path = settings.data_dir.parent / "seed_knowledge.json"
        if not seed_path.exists():
            return
        try:
            items = json.loads(seed_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return

        with self._lock:
            doc_id = "seed"
            for item in items:
                self._chunks.append(
                    Chunk(
                        id=uuid.uuid4().hex[:12],
                        doc_id=doc_id,
                        source=item.get("source", "TruthLens reference library"),
                        text=item["text"],
                    )
                )
            self._rebuild_index()
            self._persist()

    # ------------------------------------------------------------------
    def add_document(self, *, doc_id: str, source: str, text: str) -> int:
        pieces = chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        with self._lock:
            for piece in pieces:
                self._chunks.append(
                    Chunk(id=uuid.uuid4().hex[:12], doc_id=doc_id, source=source, text=piece)
                )
            self._rebuild_index()
            self._persist()
        return len(pieces)

    def remove_document(self, doc_id: str) -> None:
        with self._lock:
            self._chunks = [c for c in self._chunks if c.doc_id != doc_id]
            self._rebuild_index()
            self._persist()

    def clear(self) -> None:
        with self._lock:
            self._chunks = []
            self._bm25 = None
            self._persist()

    def search(self, query: str, top_k: int | None = None) -> list[dict]:
        top_k = top_k or settings.TOP_K_RESULTS
        with self._lock:
            if not self._chunks or self._bm25 is None:
                return []
            tokens = tokenize(query)
            if not tokens:
                return []
            scores = self._bm25.get_scores(tokens)
            ranked = sorted(zip(self._chunks, scores), key=lambda pair: pair[1], reverse=True)

        top = [pair for pair in ranked[: top_k * 3] if pair[1] > 0]
        if not top:
            return []

        max_score = max(score for _, score in top) or 1.0
        results = []
        seen_sources: set[str] = set()

        for chunk, score in top:
            relevance = round(min(score / max_score, 1.0) * 100, 1)
            if relevance / 100 < settings.MIN_RELEVANCE_SCORE:
                continue
            results.append({"source": chunk.source, "snippet": chunk.text, "relevance": relevance})
            seen_sources.add(chunk.source)
            if len(results) >= top_k:
                break

        return results

    def stats(self) -> dict:
        with self._lock:
            doc_ids = {c.doc_id for c in self._chunks}
            return {
                "documents": len(doc_ids - {"seed"}),
                "chunks": len(self._chunks),
                "seeded": "seed" in doc_ids,
            }


knowledge_base = KnowledgeBase()
