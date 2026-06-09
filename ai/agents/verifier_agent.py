from services.verification_service import (
    VerificationService
)


class VerifierAgent:

    @staticmethod
    def verify(
        claim: str
    ):

        return VerificationService.analyze(
            claim
        )