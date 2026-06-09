from rag.retriever import retrieve


class EvidenceAgent:

    @staticmethod
    def gather(
        claim: str,
        k: int = 3
    ):

        return retrieve(
            claim,
            k=k
        )