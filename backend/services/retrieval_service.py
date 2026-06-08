from rag.retriever import retrieve
from rag.reranker import Reranker


class RetrievalService:

    @staticmethod
    def get_evidence(
        query: str,
        top_k: int = 3
    ):

        evidence = retrieve(
            query=query,
            k=top_k
        )

        evidence = Reranker.rerank(
            query,
            evidence
        )

        return evidence