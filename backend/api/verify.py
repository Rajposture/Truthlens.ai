from fastapi import (
APIRouter,
Request
)

from models.claim import (
ClaimRequest
)

from services.verification_service import (
VerificationService
)

router = APIRouter()

@router.post("/verify")
def verify(
    request: Request,
    payload: ClaimRequest
):
    return (
        VerificationService
        .analyze(
            claim=payload.claim,
            user_id=None
        )
    )

