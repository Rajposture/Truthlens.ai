from llm.ollama import OllamaClient
from services.retrieval_service import RetrievalService


QUESTION_WORDS = [
    "what",
    "why",
    "how",
    "when",
    "where",
    "who",
]


def verify_claim(claim: str):

    claim_lower = claim.strip().lower()

    # Prevent questions from entering fact-check pipeline
    if any(
        claim_lower.startswith(word)
        for word in QUESTION_WORDS
    ):
        return {
            "claim": claim,
            "evidence": [],
            "analysis": """
Verdict: UNVERIFIED

Confidence: 0

Reasoning: This endpoint verifies factual claims. Questions should be sent to the AI Assistant chat endpoint.
"""
        }

    evidence = RetrievalService.get_evidence(
        claim
    )

    context = "\n\n".join(
        item["content"]
        for item in evidence
    )

    # No evidence found
    if not context.strip():

        return {
            "claim": claim,
            "evidence": [],
            "analysis": """
Verdict: UNVERIFIED

Confidence: 0

Reasoning: No relevant evidence was found in the knowledge base.
"""
        }

    prompt = f"""
You are TruthLens AI.

You are a professional fact-checking system.

Use ONLY the supplied evidence.

Rules:

1. TRUE
   - Evidence clearly supports claim.

2. FALSE
   - Evidence clearly contradicts claim.

3. MISLEADING
   - Evidence partially supports claim but important context is missing.

4. UNVERIFIED
   - Evidence is insufficient, unrelated, or unclear.

Never guess.

Claim:
{claim}

Evidence:
{context}

Return EXACTLY:

Verdict: TRUE/FALSE/MISLEADING/UNVERIFIED

Confidence: 0-100

Reasoning: Short explanation.
"""

    analysis = OllamaClient.generate(
        prompt
    )

    return {
        "claim": claim,
        "evidence": evidence,
        "analysis": analysis
    }