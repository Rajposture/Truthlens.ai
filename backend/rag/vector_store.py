import logging
from pathlib import Path

import chromadb

from core.config import settings

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Ensure Chroma directory exists
# --------------------------------------------------

db_path = Path(settings.CHROMA_DB_PATH)
db_path.mkdir(
    parents=True,
    exist_ok=True,
)


# --------------------------------------------------
# Initialize Chroma Client
# --------------------------------------------------

try:

    client = chromadb.PersistentClient(
        path=str(db_path)
    )

    collection = client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION,
        metadata={
            "description": "TruthLens Knowledge Base"
        },
    )

    logger.info(
        "ChromaDB initialized successfully."
    )

except Exception as e:

    logger.exception(
        "Failed to initialize ChromaDB."
    )

    raise RuntimeError(
        "Unable to initialize ChromaDB."
    ) from e


# --------------------------------------------------
# Helper Functions
# --------------------------------------------------

def get_collection():
    return collection


def clear_collection():

    global collection

    try:

        client.delete_collection(
            settings.CHROMA_COLLECTION
        )

        logger.info(
            "Collection deleted."
        )

    except Exception:

        logger.warning(
            "Collection did not exist."
        )

    collection = client.get_or_create_collection(
        name=settings.CHROMA_COLLECTION,
        metadata={
            "description": "TruthLens Knowledge Base"
        },
    )

    logger.info(
        "Collection recreated."
    )

    return {
        "status": "success",
        "message": "Collection cleared",
    }