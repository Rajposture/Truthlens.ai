from fastapi import APIRouter

from models.claim import ClaimRequest
from services.verification_service import VerificationService

router = APIRouter()


@router.post("/verify")
def verify(request: ClaimRequest):

    return VerificationService.analyze(
        request.claim
    )