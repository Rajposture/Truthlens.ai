import logging

from core.config import settings

from rag.embedder import generate_embedding
from rag.vector_store import get_collection

logger = logging.getLogger(__name__)

MIN_RELEVANCE_SCORE = 65


def retrieve(
    query: str,
    k: int | None = None,
    max_distance: float = 0.65,
):

    if k is None:
        k = settings.TOP_K_RESULTS

    try:

        query_embedding = generate_embedding(query)

        results = get_collection().query(
            query_embeddings=[query_embedding],
            n_results=k,
        )

        documents = results.get(
            "documents",
            [[]]
        )[0]

        metadatas = results.get(
            "metadatas",
            [[]]
        )[0]

        distances = results.get(
            "distances",
            [[]]
        )[0]

        evidence = []

        seen_sources = set()

        for doc, meta, distance in zip(
            documents,
            metadatas,
            distances,
        ):

            if distance is None:
                continue

            if distance > max_distance:
                continue

            score = round(
                (1 - min(distance, 1)) * 100,
                2,
            )

            if score < MIN_RELEVANCE_SCORE:
                continue

            source = (
                meta.get("source", "unknown")
                if meta
                else "unknown"
            )

            evidence.append(
                {
                    "content": doc,
                    "metadata": meta,
                    "distance": float(distance),
                    "score": score,
                    "source": source,
                }
            )

        evidence.sort(
            key=lambda x: x["distance"]
        )

        diversified = []

        for item in evidence:

            if item["source"] not in seen_sources:

                diversified.append(item)

                seen_sources.add(
                    item["source"]
                )

            if len(diversified) >= k:
                break

        if len(diversified) < k:

            for item in evidence:

                if item not in diversified:

                    diversified.append(item)

                if len(diversified) >= k:
                    break

        logger.info(
            "Retrieved %d documents.",
            len(diversified),
        )

        return diversified

    except Exception:

        logger.exception(
            "Retriever failed."
        )

        return []