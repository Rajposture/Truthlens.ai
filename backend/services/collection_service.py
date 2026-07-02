import logging

from rag.vector_store import (
    client,
    get_collection,
)

from core.config import settings

logger = logging.getLogger(__name__)


class CollectionService:

    @staticmethod
    def clear_collection():

        try:

            client.delete_collection(
                settings.CHROMA_COLLECTION
            )

            logger.info(
                "Deleted Chroma collection."
            )

        except Exception:

            logger.warning(
                "Collection did not exist."
            )

        get_collection()

        logger.info(
            "Created new Chroma collection."
        )

        return {
            "status": "success",
            "message": "Knowledge base cleared",
        }