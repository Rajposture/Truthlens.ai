from fastapi import APIRouter, Request

from backend.models.claim import ClaimRequest

from backend.services.verification_service import (
    VerificationService
)


router = APIRouter()


@router.post("/verify")
def verify(
    request: Request,
    payload: ClaimRequest,
):
    return VerificationService.analyze(
        claim=payload.claim,
        user_id=None,
    )