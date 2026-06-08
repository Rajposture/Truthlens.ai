
from llm.ollama import OllamaClient
from services.retrieval_service import RetrievalService

def verify_claim(claim: str):

    evidence = RetrievalService.get_evidence(
    claim
    )

    context = "\n".join(
        item["content"]
        for item in evidence
    )

    prompt = f"""
You are a professional fact checker.

Claim:
{claim}

Evidence:
{context}

Return ONLY in this format:

Verdict: <True/False/Misleading>

Confidence: <Low/Medium/High>

Reasoning: <short explanation>
"""

    analysis = OllamaClient.generate(prompt)

    return {
        "claim": claim,
        "evidence": evidence,
        "analysis": analysis
    }