from fastapi import APIRouter

from backend.models.claim import ClaimRequest
from backend.llm.ollama import OllamaClient

router = APIRouter()


@router.post("/verify")
def verify_claim(request: ClaimRequest):

    prompt = f"""
    Analyze the following news claim.

    Claim:
    {request.claim}

    Return:

    - Verdict
    - Confidence
    - Reasoning
    """

    result = OllamaClient.generate(prompt)

    return {
        "analysis": result
    }