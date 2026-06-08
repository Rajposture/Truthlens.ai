from backend.rag.embedder import generate_embedding
from backend.rag.vector_store import collection


def retrieve(query: str, k: int = 3):

    results = collection.query(
        query_embeddings=[
            generate_embedding(query)
        ],
        n_results=k
    )

    documents = results["documents"][0]
    metadatas = results["metadatas"][0]

    evidence = []

    for doc, meta in zip(documents, metadatas):
        evidence.append(
            {
                "content": doc,
                "metadata": meta
            }
        )

    return evidence