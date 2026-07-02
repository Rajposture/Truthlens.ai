from rag.retriever import retrieve
from rag.reranker import Reranker

class RetrievalService:
    MIN_RELEVANCE_SCORE = 70

    @staticmethod
    def get_evidence(
        query: str,
        top_k: int = 5,
        use_reranker: bool = False
    ):

        evidence = retrieve(
            query=query,
            k=top_k
        )

        if not evidence:
            return []

        if use_reranker:
            evidence = (
                Reranker.rerank(
                    query,
                    evidence
                )
            )

        filtered = []

        for item in evidence:

            score = float(
                item.get(
                    "score",
                    0
                )
            )

            if (
                score >=
                RetrievalService.MIN_RELEVANCE_SCORE
            ):
                filtered.append(
                    item
                )

        return filtered[:top_k]

