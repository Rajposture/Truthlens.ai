import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from config import settings
from knowledge_base import knowledge_base
from rate_limit import limiter
from schemas import DocumentInfo, KnowledgeStats
from services.documents import ALLOWED_EXTENSIONS, documents_service

router = APIRouter(prefix="/api/documents", tags=["Knowledge Base"])


@router.post("/upload", response_model=DocumentInfo)
@limiter.limit(settings.RATE_LIMIT_UPLOAD)
async def upload_document(request: Request, file: UploadFile = File(...)) -> DocumentInfo:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, TXT, and Markdown files are supported.",
        )

    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    tmp_path = settings.uploads_dir / f"{uuid.uuid4().hex}{suffix}"
    size = 0

    try:
        with open(tmp_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File exceeds the {settings.MAX_UPLOAD_MB}MB upload limit.",
                    )
                buffer.write(chunk)

        return documents_service.ingest(tmp_path, file.filename or "document")

    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface a clean message, log details
        raise HTTPException(status_code=500, detail="Could not process that file.") from exc
    finally:
        await file.close()
        tmp_path.unlink(missing_ok=True)


@router.get("", response_model=list[DocumentInfo])
def list_documents() -> list[dict]:
    return documents_service.list()


@router.get("/stats", response_model=KnowledgeStats)
def stats() -> dict:
    return knowledge_base.stats()


@router.delete("/{doc_id}")
def delete_document(doc_id: str) -> dict:
    removed = documents_service.remove(doc_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"status": "success", "message": "Document removed."}


@router.delete("")
def clear_documents() -> dict:
    documents_service.clear_all()
    return {"status": "success", "message": "Knowledge base cleared."}
