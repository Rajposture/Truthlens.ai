from fastapi import APIRouter, Request

from config import settings
from rate_limit import limiter
from schemas import ClaimRequest, VerdictResponse
from services.verification import verify_claim

router = APIRouter(prefix="/api", tags=["Verification"])


@router.post("/verify", response_model=VerdictResponse)
@limiter.limit(settings.RATE_LIMIT_VERIFY)
async def verify(request: Request, payload: ClaimRequest) -> VerdictResponse:
    return await verify_claim(payload.claim)
