import logging
import shutil
import uuid
from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks,
    HTTPException,
    status,
)

from core.config import settings

from services.document_service import DocumentService
from services.document_registry_service import (
    DocumentRegistryService,
)
from services.collection_service import (
    CollectionService,
)
from services.stats_service import (
    StatsService,
)

logger = logging.getLogger(__name__)

router = APIRouter()

UPLOAD_DIR = Path("data/raw/uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".txt",
}


@router.post("/documents/ingest")
def ingest_documents():

    result = DocumentService.ingest_directory(
        "data/raw"
    )

    return {
        "status": "success",
        "documents": result,
    }


@router.post("/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):

    suffix = Path(file.filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files are supported.",
        )

    unique_name = (
        f"{uuid.uuid4().hex}{suffix}"
    )

    file_path = (
        UPLOAD_DIR / unique_name
    )

    size = 0

    try:

        with open(file_path, "wb") as buffer:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                size += len(chunk)

                if (
                    size
                    > settings.MAX_UPLOAD_SIZE
                ):
                    buffer.close()

                    file_path.unlink(
                        missing_ok=True
                    )

                    raise HTTPException(
                        status_code=413,
                        detail="File exceeds maximum upload size.",
                    )

                buffer.write(chunk)

        background_tasks.add_task(
            DocumentService.ingest_document,
            str(file_path),
        )

        logger.info(
            "Uploaded %s",
            unique_name,
        )

        return {
            "status": "success",
            "message": "File uploaded successfully. Processing started.",
            "file": unique_name,
        }

    except HTTPException:
        raise

    except Exception as e:

        logger.exception(
            "Upload failed"
        )

        file_path.unlink(
            missing_ok=True
        )

        raise HTTPException(
            status_code=500,
            detail=str(e),
        )

    finally:
        await file.close()


@router.get("/documents/list")
def list_documents():

    return {
        "documents":
        DocumentRegistryService.list_documents()
    }


@router.get("/documents/stats")
def document_stats():

    return StatsService.get_stats()


@router.delete("/documents/clear")
def clear_documents():

    return CollectionService.clear_collection()


@router.get("/documents/test")
def test_documents():

    return {
        "status": "documents router working"
    }