"""Handles uploaded PDF/TXT/Markdown files: text extraction + indexing + registry."""
from __future__ import annotations

import uuid
from pathlib import Path

from pypdf import PdfReader

from config import settings
from knowledge_base import knowledge_base
from schemas import DocumentInfo
from storage import JSONStore
from utils import now_iso

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}


def _extract_text(path: Path) -> str:
    if path.suffix.lower() == ".pdf":
        reader = PdfReader(str(path))
        pages = []
        for page in reader.pages:
            try:
                text = page.extract_text() or ""
            except Exception:  # a single malformed page shouldn't sink the whole file
                text = ""
            if text.strip():
                pages.append(text)
        return "\n\n".join(pages)
    return path.read_text(encoding="utf-8", errors="ignore")


class DocumentsService:
    def __init__(self) -> None:
        self._store = JSONStore(settings.data_dir / "documents.json", default=[])

    def ingest(self, path: Path, original_filename: str) -> DocumentInfo:
        text = _extract_text(path)
        if not text.strip():
            raise ValueError(f"No readable text was found in {original_filename}.")

        doc_id = uuid.uuid4().hex[:12]
        chunk_count = knowledge_base.add_document(doc_id=doc_id, source=original_filename, text=text)
        if chunk_count == 0:
            raise ValueError(f"{original_filename} didn't contain enough text to index.")

        info = DocumentInfo(
            id=doc_id,
            filename=original_filename,
            chunks=chunk_count,
            size_kb=round(path.stat().st_size / 1024, 1),
            uploaded_at=now_iso(),
        )
        docs = self._store.read()
        docs.insert(0, info.model_dump())
        self._store.write(docs)
        return info

    def list(self) -> list[dict]:
        return self._store.read()

    def remove(self, doc_id: str) -> bool:
        docs = self._store.read()
        remaining = [d for d in docs if d["id"] != doc_id]
        if len(remaining) == len(docs):
            return False
        self._store.write(remaining)
        knowledge_base.remove_document(doc_id)
        return True

    def clear_all(self) -> None:
        self._store.write([])
        knowledge_base.clear()


documents_service = DocumentsService()
