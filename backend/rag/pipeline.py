from llm.ollama import (
    OllamaClient
)

from services.retrieval_service import (
    RetrievalService
)

import time


QUESTION_WORDS = [
    "what",
    "why",
    "how",
    "when",
    "where",
    "who",
]


def verify_claim(
    claim: str
):

    claim_lower = (
        claim.strip()
        .lower()
    )

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

Reasoning: Questions belong in the AI Assistant.
"""
        }

    retrieval_start = time.time()

    evidence = (
        RetrievalService
        .get_evidence(
            query=claim,
            top_k=3,
            use_reranker=True
        )
    )

    print(
        f"[VERIFY] Retrieval: "
        f"{time.time() - retrieval_start:.2f}s"
    )

    if not evidence:

        return {
            "claim": claim,
            "evidence": [],
            "analysis": """
Verdict: UNVERIFIED

Confidence: 0

Reasoning: No relevant evidence found.
"""
        }

    context = "\n\n".join(
        [
            f"Source: {item['metadata'].get('source','Unknown')}\n"
            f"{item['content'][:500]}"
            for item in evidence
        ]
    )

    prompt = f"""
Fact Check The Following Claim

Claim:
{claim}

Evidence:
{context}

Rules:

- Use ONLY the supplied evidence.
- Do not assume facts.
- Do not use outside knowledge.

Return EXACTLY:

Verdict: TRUE/FALSE/MISLEADING/UNVERIFIED

Confidence: 0-100

Reasoning: One short paragraph.
"""

    llm_start = time.time()

    analysis = (
        OllamaClient.generate(
            prompt
        )
    )

    print(
        f"[VERIFY] LLM: "
        f"{time.time() - llm_start:.2f}s"
    )

    return {
        "claim": claim,
        "evidence": evidence,
        "analysis": analysis
    }