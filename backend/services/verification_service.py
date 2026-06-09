import re

from rag.pipeline import verify_claim

from services.verdict_parser import (
    VerdictParser
)

from services.report_service import (
    ReportService
)

from Database.crud import (
    save_verification
)


class VerificationService:

    @staticmethod
    def analyze(
        claim: str,
        user_id: int | None = None
    ):

        result = verify_claim(
            claim
        )

        analysis = result["analysis"]

        verdict = VerdictParser.classify(
            analysis
        )

        confidence = "Unknown"

        reasoning = analysis

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

        if confidence_match:

            confidence = (
                confidence_match
                .group(1)
                .strip()
            )

        if reasoning_match:

            reasoning = (
                reasoning_match
                .group(1)
                .strip()
            )

        response = {
            "claim": claim,
            "verdict": verdict,
            "confidence": confidence,
            "reasoning": reasoning,
            "evidence": result["evidence"]
        }

        try:

            save_verification(
                response,
                user_id=user_id
            )

        except Exception as e:

            print(
                f"Failed to save verification: {e}"
            )

        try:

            ReportService.save_report(
                response
            )

        except Exception as e:

            print(
                f"Failed to save report: {e}"
            )

        return response