from llm.gemini import (
GeminiClient
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
"is",
"are",
"can",
"could",
"should",
"would",
"will",
"do",
"does",
"did",
]

def verify_claim(
claim: str
):
    claim = claim.strip()

    if not claim:
        return {
            "claim": claim,
            "evidence": [],
            "analysis": """


Verdict: UNVERIFIED

Confidence: 0

Reasoning: Empty claim provided.
"""
        }

    claim_lower = claim.lower()

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

Reasoning: Questions should be asked in the AI Assistant.
"""
        }

    retrieval_start = time.time()

    evidence = (
        RetrievalService
        .get_evidence(
            query=claim,
            top_k=3,
            use_reranker=False
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
            (
                f"Source: "
                f"{item['metadata'].get('source', 'Unknown')}\n\n"
                f"{item['content'][:800]}"
            )
            for item in evidence
        ]
    )

    prompt = f"""


You are TruthLens AI.

Your task is to verify claims using ONLY the evidence provided.

Claim:
{claim}

Evidence:
{context}

Instructions:

* Use only the supplied evidence.
* Do not use outside knowledge.
* If evidence is insufficient, return UNVERIFIED.
* Be objective.
* Do not speculate.
* Keep reasoning concise.

Return EXACTLY in this format:

Verdict: TRUE | FALSE | MISLEADING | UNVERIFIED

Confidence: 0-100

Reasoning: Brief explanation based only on the evidence.
"""

    llm_start = time.time()

    try:
        analysis = (
            GeminiClient.generate(
                prompt
            )
        )
    except Exception as e:
        print(
            f"[VERIFY GEMINI ERROR] {e}"
        )
        analysis = """


Verdict: UNVERIFIED

Confidence: 0

Reasoning: Verification service is temporarily unavailable.
"""

    print(
        f"[VERIFY] LLM: "
        f"{time.time() - llm_start:.2f}s"
    )

    return {
        "claim": claim,
        "evidence": evidence,
        "analysis": analysis
    }

