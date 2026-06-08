class Reranker:

    @staticmethod
    def rerank(
        query: str,
        evidence: list
    ):
        """
        Placeholder reranker.

        Later:
        - Cross Encoder
        - BGE Reranker
        - Cohere Rerank

        For now just return evidence.
        """

        return evidence