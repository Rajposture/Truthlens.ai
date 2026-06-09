from pathlib import Path

from rag.embedder import generate_embedding
from rag.vector_store import collection

from services.pdf_service import (
    PDFService
)


class IngestionService:

    CHUNK_SIZE = 800
    CHUNK_OVERLAP = 150
    MIN_CHUNK_LENGTH = 100

    @staticmethod
    def split_text(
        content: str
    ):

        documents = []

        start = 0

        while start < len(content):

            end = (
                start +
                IngestionService.CHUNK_SIZE
            )

            chunk = content[start:end].strip()

            if (
                len(chunk)
                >= IngestionService.MIN_CHUNK_LENGTH
            ):
                documents.append(chunk)

            start += (
                IngestionService.CHUNK_SIZE
                -
                IngestionService.CHUNK_OVERLAP
            )

        return documents

    @staticmethod
    def ingest_pdf(
        file_path: str
    ):

        path = Path(file_path)

        if not path.exists():

            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        print(
            f"[PDF] Reading {path.name}"
        )

        content = (
            PDFService.extract_text(
                str(path)
            )
        )

        if not content.strip():

            raise ValueError(
                f"No text extracted from {path.name}"
            )

        documents = (
            IngestionService.split_text(
                content
            )
        )

        if not documents:

            raise ValueError(
                f"No valid chunks generated from {path.name}"
            )

        ids = []
        embeddings = []
        metadatas = []

        for idx, doc in enumerate(documents):

            chunk_id = (
                f"{path.stem}_pdf_{idx}"
            )

            try:

                embedding = (
                    generate_embedding(doc)
                )

                ids.append(
                    chunk_id
                )

                embeddings.append(
                    embedding
                )

                metadatas.append(
                    {
                        "source": path.name,
                        "type": "pdf",
                        "chunk": idx,
                        "length": len(doc)
                    }
                )

            except Exception as e:

                print(
                    f"[EMBED ERROR] "
                    f"{chunk_id}: {e}"
                )

        if not ids:

            raise ValueError(
                "No embeddings generated."
            )

        try:

            collection.add(
                ids=ids,
                documents=documents[
                    : len(ids)
                ],
                embeddings=embeddings,
                metadatas=metadatas
            )

        except Exception as e:

            print(
                f"[CHROMA ERROR] {e}"
            )
            raise

        print(
            f"[SUCCESS] "
            f"{path.name} -> "
            f"{len(ids)} chunks"
        )

        return {
            "status": "success",
            "file": path.name,
            "type": "pdf",
            "chunks_ingested": len(ids)
        }

    @staticmethod
    def ingest_txt(
        file_path: str
    ):

        path = Path(file_path)

        if not path.exists():

            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        print(
            f"[TXT] Reading {path.name}"
        )

        content = path.read_text(
            encoding="utf-8"
        )

        if not content.strip():

            raise ValueError(
                f"Empty file: {path.name}"
            )

        documents = (
            IngestionService.split_text(
                content
            )
        )

        if not documents:

            raise ValueError(
                f"No valid chunks generated from {path.name}"
            )

        ids = []
        embeddings = []
        metadatas = []

        for idx, doc in enumerate(documents):

            chunk_id = (
                f"{path.stem}_txt_{idx}"
            )

            try:

                embedding = (
                    generate_embedding(doc)
                )

                ids.append(
                    chunk_id
                )

                embeddings.append(
                    embedding
                )

                metadatas.append(
                    {
                        "source": path.name,
                        "type": "txt",
                        "chunk": idx,
                        "length": len(doc)
                    }
                )

            except Exception as e:

                print(
                    f"[EMBED ERROR] "
                    f"{chunk_id}: {e}"
                )

        if not ids:

            raise ValueError(
                "No embeddings generated."
            )

        try:

            collection.add(
                ids=ids,
                documents=documents[
                    : len(ids)
                ],
                embeddings=embeddings,
                metadatas=metadatas
            )

        except Exception as e:

            print(
                f"[CHROMA ERROR] {e}"
            )
            raise

        print(
            f"[SUCCESS] "
            f"{path.name} -> "
            f"{len(ids)} chunks"
        )

        return {
            "status": "success",
            "file": path.name,
            "type": "txt",
            "chunks_ingested": len(ids)
        }