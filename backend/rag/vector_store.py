import logging
from pathlib import Path

import chromadb

from core.config import settings

logger = logging.getLogger(__name__)

db_path = Path(settings.CHROMA_DB_PATH)
db_path.mkdir(
    parents=True,
    exist_ok=True,
)

client = chromadb.PersistentClient(
    path=str(db_path)
)

collection = client.get_or_create_collection(
    name=settings.CHROMA_COLLECTION,
    metadata={
        "description": "TruthLens Knowledge Base"
    },
)

logger.info("ChromaDB initialized successfully.")


def get_collection():
    return collection


def clear_collection():
    global collection

    try:
        client.delete_collection(settings.CHROMA_COLLECTION)
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION,
        metadata={
            "description": "TruthLens Knowledge Base"
        },
    )

    return {
        "status": "success",
        "message": "Collection cleared",
    }