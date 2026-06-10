from pathlib import Path
from datetime import datetime


class DocumentRegistryService:

    DATA_DIR = Path(
        "data/raw"
    )

    @classmethod
    def list_documents(
        cls
    ):

        if not cls.DATA_DIR.exists():

            return []

        documents = []

        for file in cls.DATA_DIR.rglob("*"):

            if not file.is_file():
                continue

            stat = file.stat()

            documents.append(
                {
                    "filename": file.name,

                    "path": str(file),

                    "extension":
                    file.suffix.lower(),

                    "size_mb": round(
                        stat.st_size
                        / (1024 * 1024),
                        2
                    ),

                    "last_modified":
                    datetime.fromtimestamp(
                        stat.st_mtime
                    ).strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                }
            )

        documents.sort(
            key=lambda x:
            x["last_modified"],
            reverse=True
        )

        return documents

    @classmethod
    def document_count(
        cls
    ):

        return len(
            cls.list_documents()
        )

    @classmethod
    def document_types(
        cls
    ):

        docs = cls.list_documents()

        types = {}

        for doc in docs:

            ext = doc[
                "extension"
            ]

            types[ext] = (
                types.get(ext, 0)
                + 1
            )

        return types