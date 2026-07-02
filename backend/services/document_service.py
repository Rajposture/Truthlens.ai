import logging
from pathlib import Path

from core.config import settings
from services.ingestion_service import IngestionService


logger = logging.getLogger(__name__)


class DocumentService:

    SUPPORTED_TYPES = {
        ".pdf",
        ".txt",
    }

    @staticmethod
    def ingest_document(file_path: str):

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        suffix = path.suffix.lower()

        if suffix not in DocumentService.SUPPORTED_TYPES:
            raise ValueError(
                f"Unsupported file type: {suffix}"
            )

        if path.stat().st_size == 0:
            raise ValueError(
                "Uploaded file is empty."
            )

        if path.stat().st_size > settings.MAX_UPLOAD_SIZE:
            raise ValueError(
                "File exceeds maximum upload size."
            )

        logger.info(
            "Processing document: %s",
            path.name,
        )

        try:

            if suffix == ".pdf":
                result = IngestionService.ingest_pdf(
                    str(path)
                )

            else:
                result = IngestionService.ingest_txt(
                    str(path)
                )

            logger.info(
                "Successfully ingested %s",
                path.name,
            )

            return result

        except Exception:

            logger.exception(
                "Failed to ingest %s",
                path.name,
            )

            raise

    @staticmethod
    def ingest_directory(directory: str):

        path = Path(directory)

        if not path.exists():
            raise FileNotFoundError(
                f"Directory not found: {directory}"
            )

        files = [
            f
            for f in path.iterdir()
            if (
                f.is_file()
                and f.suffix.lower()
                in DocumentService.SUPPORTED_TYPES
            )
        ]

        logger.info(
            "Found %d supported documents.",
            len(files),
        )

        results = []

        for file in files:

            try:

                result = (
                    DocumentService.ingest_document(
                        str(file)
                    )
                )

                results.append(
                    {
                        "file": file.name,
                        "status": "success",
                        "result": result,
                    }
                )

            except Exception as e:

                results.append(
                    {
                        "file": file.name,
                        "status": "failed",
                        "error": str(e),
                    }
                )

        return {
            "processed": len(results),
            "successful": len(
                [
                    r
                    for r in results
                    if r["status"] == "success"
                ]
            ),
            "failed": len(
                [
                    r
                    for r in results
                    if r["status"] == "failed"
                ]
            ),
            "results": results,
        }