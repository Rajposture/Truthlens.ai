from backend.rag.vector_store import (
    client,
    COLLECTION_NAME
)


class CollectionService:

    @staticmethod
    def clear_collection():

        try:

            client.delete_collection(
                COLLECTION_NAME
            )

        except Exception:
            pass

        client.get_or_create_collection(
            name=COLLECTION_NAME
        )

        return {
            "status": "success",
            "message": "Knowledge base cleared"
        }