from sentence_transformers import (
    CrossEncoder
)


class Reranker:

    model = CrossEncoder(
        "cross-encoder/ms-marco-MiniLM-L-6-v2"
    )

    @classmethod
    def rerank(
        cls,
        query: str,
        evidence: list
    ):

        if not evidence:
            return []

        try:

            pairs = [
                (
                    query,
                    item["content"]
                )
                for item in evidence
            ]

            scores = cls.model.predict(
                pairs
            )

            ranked = []

            for item, score in zip(
                evidence,
                scores
            ):

                item[
                    "rerank_score"
                ] = float(score)

                ranked.append(item)

            ranked.sort(
                key=lambda x:
                x["rerank_score"],
                reverse=True
            )

            return ranked[:5]

        except Exception as e:

            print(
                f"[RERANK ERROR] {e}"
            )

            return evidence[:5]