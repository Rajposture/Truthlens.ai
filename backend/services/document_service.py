from pathlib import Path

from backend.services.ingestion_service import (
    IngestionService
)


class DocumentService:

    @staticmethod
    def ingest_document(
        file_path: str
    ):

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        suffix = path.suffix.lower()

        if suffix == ".txt":
            return IngestionService.ingest_txt(
                str(path)
            )

        if suffix == ".pdf":
            return IngestionService.ingest_pdf(
                str(path)
            )

        raise ValueError(
            f"Unsupported file type: {suffix}"
        )

    @staticmethod
    def ingest_directory(
        directory: str
    ):

        path = Path(directory)

        if not path.exists():
            raise FileNotFoundError(
                f"Directory not found: {directory}"
            )

        results = []

        for file in path.iterdir():

            if file.is_file():

                try:

                    result = (
                        DocumentService.ingest_document(
                            str(file)
                        )
                    )

                    results.append(result)

                except ValueError:
                    continue

        return results