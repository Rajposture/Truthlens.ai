import chromadb

COLLECTION_NAME = "truthlens"

client = chromadb.PersistentClient(
    path="data/chroma_db"
)

collection = client.get_or_create_collection(
    name=COLLECTION_NAME
)