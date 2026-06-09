from ai.agents.claim_extractor import (
    ClaimExtractor
)

from ai.agents.verifier_agent import (
    VerifierAgent
)

from ai.agents.confidence_agent import (
    ConfidenceAgent
)


class TruthLensPipeline:

    @staticmethod
    def analyze_document(
        text: str
    ):

        claims = (
            ClaimExtractor.extract(
                text
            )
        )

        results = []

        for claim in claims:

            result = (
                VerifierAgent.verify(
                    claim
                )
            )

            result[
                "confidence_score"
            ] = (
                ConfidenceAgent.score(
                    result.get(
                        "confidence",
                        "50"
                    )
                )
            )

            results.append(
                result
            )

        return results