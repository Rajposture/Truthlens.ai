import re

from rag.pipeline import verify_claim

from services.verdict_parser import VerdictParser
class VerificationService:

    @staticmethod
    def analyze(claim: str):

        result = verify_claim(claim)

        analysis = result["analysis"]

        verdict = "Unknown"
        confidence = "Unknown"
        reasoning = analysis

        verdict_match = re.search(
            r"Verdict:\s*(.*)",
            analysis,
            re.IGNORECASE
        )
        verdict = VerdictParser.classify(
    analysis
)
        confidence_match = re.search(
            r"Confidence:\s*(.*)",
            analysis,
            re.IGNORECASE
        )

        reasoning_match = re.search(
            r"Reasoning:\s*(.*)",
            analysis,
            re.IGNORECASE | re.DOTALL
        )

        if verdict_match:
            verdict = verdict_match.group(1).strip()

        if confidence_match:
            confidence = confidence_match.group(1).strip()

        if reasoning_match:
            reasoning = reasoning_match.group(1).strip()

        return {
            "claim": claim,
            "verdict": verdict,
            "confidence": confidence,
            "reasoning": reasoning,
            "evidence": result["evidence"]
        }