from pydantic import BaseModel


class Report(BaseModel):
    claim: str
    verdict: str
    confidence: str
    reasoning: str