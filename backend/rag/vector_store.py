import chromadb

COLLECTION_NAME = "truthlens"

client = chromadb.PersistentClient(
    path="data/chroma_db"
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={
        "description":
        "TruthLens Knowledge Base"
    }
)


def clear_collection():

    global collection

    try:

        client.delete_collection(
            COLLECTION_NAME
        )

    except Exception:
        pass

    collection = (
        client.get_or_create_collection(
            name=COLLECTION_NAME
        )
    )

    return {
        "status": "success",
        "message":
        "Collection cleared"
    }