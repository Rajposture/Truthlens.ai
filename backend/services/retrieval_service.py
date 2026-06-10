from rag.retriever import retrieve
from rag.reranker import Reranker


class RetrievalService:

    @staticmethod
    def get_evidence(
        query: str,
        top_k: int = 3,
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

        return evidence[:top_k]