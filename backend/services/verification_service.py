import re

from rag.pipeline import (
    verify_claim
)

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

        try:

            result = verify_claim(
                claim
            )

            analysis = result.get(
                "analysis",
                ""
            )

            verdict = (
                VerdictParser.classify(
                    analysis
                )
            )

            confidence = "0"

            confidence_match = re.search(
                r"Confidence:\s*(.*)",
                analysis,
                re.IGNORECASE
            )

            if confidence_match:

                confidence = (
                    confidence_match
                    .group(1)
                    .strip()
                )

            reasoning_match = re.search(
                r"Reasoning:\s*(.*)",
                analysis,
                re.IGNORECASE |
                re.DOTALL
            )

            reasoning = (
                reasoning_match.group(1)
                if reasoning_match
                else analysis
            )

            response = {

                "claim": claim,

                "verdict": verdict,

                "confidence":
                confidence,

                "reasoning":
                reasoning,

                "evidence":
                result.get(
                    "evidence",
                    []
                )
            }

            try:

                save_verification(
                    response,
                    user_id
                )

            except Exception as e:

                print(
                    f"[DB] {e}"
                )

            try:

                ReportService.save_report(
                    response
                )

            except Exception as e:

                print(
                    f"[REPORT] {e}"
                )

            return response

        except Exception as e:

            return {
                "claim": claim,
                "verdict":
                "UNVERIFIED",
                "confidence":
                "0",
                "reasoning":
                str(e),
                "evidence": []
            }