from pathlib import Path

from rag.embedder import generate_embedding
from rag.vector_store import collection
from services.pdf_service import PDFService


class IngestionService:

    @staticmethod
    def ingest_txt(file_path: str):

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        content = path.read_text(
            encoding="utf-8"
        )

        documents = [
            doc.strip()
            for doc in content.split("\n")
            if doc.strip()
        ]

        ingested = 0

        for idx, doc in enumerate(documents):

            collection.add(
                ids=[f"{path.stem}_{idx}"],
                documents=[doc],
                embeddings=[
                    generate_embedding(doc)
                ],
                metadatas=[
                    {
                        "source": path.name,
                        "type": "txt"
                    }
                ]
            )

            ingested += 1

        return {
            "status": "success",
            "file": path.name,
            "type": "txt",
            "documents_ingested": ingested
        }

    @staticmethod
    def ingest_pdf(file_path: str):

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        content = PDFService.extract_text(
            str(path)
        )

        documents = [
            doc.strip()
            for doc in content.split("\n")
            if doc.strip()
        ]

        ingested = 0

        for idx, doc in enumerate(documents):

            collection.add(
                ids=[f"{path.stem}_pdf_{idx}"],
                documents=[doc],
                embeddings=[
                    generate_embedding(doc)
                ],
                metadatas=[
                    {
                        "source": path.name,
                        "type": "pdf"
                    }
                ]
            )

            ingested += 1

        return {
            "status": "success",
            "file": path.name,
            "type": "pdf",
            "documents_ingested": ingested
        }