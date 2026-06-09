from pathlib import Path

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    BackgroundTasks
)

from services.document_service import DocumentService
from services.document_registry_service import (
    DocumentRegistryService
)
from services.collection_service import (
    CollectionService
)
from services.stats_service import StatsService

router = APIRouter()


@router.post("/documents/ingest")
def ingest_documents():

    result = DocumentService.ingest_directory(
        "data/raw"
    )

    return {
        "status": "success",
        "documents": result
    }


@router.post("/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):

    upload_dir = Path(
        "data/raw/uploads"
    )

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = (
        upload_dir / file.filename
    )

    contents = await file.read()

    with open(
        file_path,
        "wb"
    ) as f:
        f.write(contents)

    background_tasks.add_task(
        DocumentService.ingest_document,
        str(file_path)
    )

    return {
        "status": "success",
        "message": "File uploaded. Processing started.",
        "file": file.filename
    }


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