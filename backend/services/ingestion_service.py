from pathlib import Path

from rag.embedder import generate_embedding
from rag.vector_store import collection
from services.pdf_service import PDFService


class IngestionService:

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

        # Split PDF into larger chunks
        chunk_size = 1000

        documents = [
            content[i:i + chunk_size]
            for i in range(
                0,
                len(content),
                chunk_size
            )
        ]

        ids = []
        embeddings = []
        metadatas = []

        for idx, doc in enumerate(documents):

            ids.append(
                f"{path.stem}_pdf_{idx}"
            )

            embeddings.append(
                generate_embedding(doc)
            )

            metadatas.append(
                {
                    "source": path.name,
                    "type": "pdf",
                    "chunk": idx
                }
            )

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        return {
            "status": "success",
            "file": path.name,
            "type": "pdf",
            "chunks_ingested": len(documents)
        }

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

        chunk_size = 1000

        documents = [
            content[i:i + chunk_size]
            for i in range(
                0,
                len(content),
                chunk_size
            )
        ]

        ids = []
        embeddings = []
        metadatas = []

        for idx, doc in enumerate(documents):

            ids.append(
                f"{path.stem}_txt_{idx}"
            )

            embeddings.append(
                generate_embedding(doc)
            )

            metadatas.append(
                {
                    "source": path.name,
                    "type": "txt",
                    "chunk": idx
                }
            )

        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
        )

        return {
            "status": "success",
            "file": path.name,
            "type": "txt",
            "chunks_ingested": len(documents)
        }