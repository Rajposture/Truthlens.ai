from fastapi import APIRouter

from backend.models.claim import ClaimRequest
from backend.services.verification_service import VerificationService

router = APIRouter()


@router.post("/verify")
def verify(request: ClaimRequest):

    return VerificationService.analyze(
        request.claim
    )