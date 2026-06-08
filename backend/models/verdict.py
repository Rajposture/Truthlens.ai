from pydantic import BaseModel


class VerdictResponse(BaseModel):
    claim: str
    verdict: str
    confidence: str
    reasoning: str
    evidence: list[str]