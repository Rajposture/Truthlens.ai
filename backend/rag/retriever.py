from core.config import settings

from rag.embedder import (
    generate_embedding
)

from rag.vector_store import (
    collection
)


def retrieve(
    query: str,
    k: int | None = None,
    max_distance: float = 1.2
):

    if k is None:
        k = settings.TOP_K_RESULTS

    try:

        query_embedding = (
            generate_embedding(query)
        )

        results = collection.query(
            query_embeddings=[
                query_embedding
            ],
            n_results=max(
                k * 2,
                10
            )
        )

        documents = (
            results.get(
                "documents",
                [[]]
            )[0]
        )

        metadatas = (
            results.get(
                "metadatas",
                [[]]
            )[0]
        )

        distances = (
            results.get(
                "distances",
                [[]]
            )[0]
        )

        evidence = []

        seen_sources = set()

        for doc, meta, distance in zip(
            documents,
            metadatas,
            distances
        ):

            if distance is None:
                continue

            if distance > max_distance:
                continue

            source = (
                meta.get(
                    "source",
                    "unknown"
                )
                if meta
                else "unknown"
            )

            score = round(
                (
                    1 -
                    min(distance, 1)
                ) * 100,
                2
            )

            evidence.append(
                {
                    "content": doc,
                    "metadata": meta,
                    "distance": float(
                        distance
                    ),
                    "score": score,
                    "source": source
                }
            )

        evidence.sort(
            key=lambda x:
            x["distance"]
        )

        diversified = []

        for item in evidence:

            source = item["source"]

            if (
                source
                not in seen_sources
            ):

                diversified.append(
                    item
                )

                seen_sources.add(
                    source
                )

            if len(
                diversified
            ) >= k:
                break

        if len(diversified) < k:

            for item in evidence:

                if item not in diversified:

                    diversified.append(
                        item
                    )

                if len(
                    diversified
                ) >= k:
                    break

        return diversified

    except Exception as e:

        print(
            f"[RETRIEVER ERROR] {e}"
        )

        return []