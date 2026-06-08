from pathlib import Path

from fastapi import APIRouter
from fastapi import UploadFile
from fastapi import File

from backend.services.document_service import (
    DocumentService
)

from backend.services.document_registry_service import (
    DocumentRegistryService
)

from backend.services.collection_service import (
    CollectionService
)

from backend.services.stats_service import (
    StatsService
)

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
    file: UploadFile = File(...)
):

    upload_dir = Path("data/raw/uploads")

    upload_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    file_path = upload_dir / file.filename

    contents = await file.read()

    with open(
        file_path,
        "wb"
    ) as f:
        f.write(contents)

    result = (
        DocumentService.ingest_document(
            str(file_path)
        )
    )

    return {
        "message": "Uploaded Successfully",
        "result": result
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