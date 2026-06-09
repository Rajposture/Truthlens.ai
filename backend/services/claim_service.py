from services.verification_service import (
    VerificationService
)


class ClaimService:

    @staticmethod
    def verify(
        claim: str
    ):

        return (
            VerificationService
            .analyze(claim)
        )