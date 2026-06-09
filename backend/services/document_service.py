from pathlib import Path

from services.ingestion_service import (
    IngestionService
)


class DocumentService:

    SUPPORTED_TYPES = [
        ".pdf",
        ".txt"
    ]

    @staticmethod
    def ingest_document(
        file_path: str
    ):

        path = Path(file_path)

        if not path.exists():

            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        suffix = (
            path.suffix.lower()
        )

        if suffix not in (
            DocumentService
            .SUPPORTED_TYPES
        ):
            raise ValueError(
                f"Unsupported file type: {suffix}"
            )

        print(
            f"[INGEST] Processing: {path.name}"
        )

        try:

            if suffix == ".txt":

                result = (
                    IngestionService
                    .ingest_txt(
                        str(path)
                    )
                )

            elif suffix == ".pdf":

                result = (
                    IngestionService
                    .ingest_pdf(
                        str(path)
                    )
                )

            print(
                f"[SUCCESS] {path.name}"
            )

            return result

        except Exception as e:

            print(
                f"[FAILED] {path.name}: {e}"
            )

            raise

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

        files = [
            f
            for f in path.iterdir()
            if f.is_file()
        ]

        print(
            f"[INFO] Found {len(files)} files"
        )

        for file in files:

            try:

                result = (
                    DocumentService
                    .ingest_document(
                        str(file)
                    )
                )

                results.append(
                    {
                        "file": file.name,
                        "status": "success",
                        "result": result
                    }
                )

            except Exception as e:

                results.append(
                    {
                        "file": file.name,
                        "status": "failed",
                        "error": str(e)
                    }
                )

        return {
            "processed": len(results),
            "results": results
        }