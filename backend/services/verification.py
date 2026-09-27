"""Evidence-first claim verification with an adaptive ML side signal."""
from __future__ import annotations

import json
import logging
import re
import time
import uuid

from config import settings
from llm import GroqError, chat
from adaptive_ml import adaptive_learner
from retrieval import gather_evidence
from schemas import Evidence, MLPrediction, VerdictResponse
from services.history import history_service
from utils import now_iso

logger = logging.getLogger("truthlens.verification")

SYSTEM_PROMPT = """You are the evidence-verification engine inside TruthLens AI.
Your job is to classify a factual claim from the supplied evidence.

Rules:
- Evidence comes first. Never invent facts or citations.
- Prefer authoritative, direct, recent evidence when available.
- Distinguish contradiction, support, partial support, and insufficient evidence.
- Use Unverified when the evidence does not establish the claim.
- For breaking/current claims, recent web evidence is more appropriate than an old static source.
- Return JSON only.
"""

_VALID_VERDICTS = {"True", "False", "Misleading", "Unverified"}
_QUESTION_STARTERS = {
    "what", "why", "how", "when", "where", "who", "whom", "whose", "which",
    "is", "are", "can", "could", "should", "would", "will", "do", "does", "did",
    "has", "have", "had",
}
_LEADING_WORD = re.compile(r"[A-Za-z']+")


def _looks_like_question(claim: str) -> bool:
    stripped = claim.strip()
    if stripped.endswith("?"):
        return True
    match = _LEADING_WORD.match(stripped)
    return bool(match and match.group(0).lower() in _QUESTION_STARTERS)


def _parse_model_output(raw: str) -> dict:
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        try:
            data = json.loads(match.group(0)) if match else {}
        except json.JSONDecodeError:
            data = {}

    verdict = str(data.get("verdict", "Unverified")).strip().capitalize()
    if verdict not in _VALID_VERDICTS:
        verdict = "Unverified"

    try:
        confidence = int(round(float(data.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0

    reasoning = str(data.get("reasoning") or "The evidence did not produce a usable verification.").strip()
    key_points = data.get("key_points") or []
    if not isinstance(key_points, list):
        key_points = []
    key_points = [str(x).strip() for x in key_points if str(x).strip()][:4]

    return {
        "verdict": verdict,
        "confidence": max(0, min(100, confidence)),
        "reasoning": reasoning,
        "key_points": key_points,
    }


async def verify_claim(claim: str) -> VerdictResponse:
    started = time.perf_counter()
    claim = claim.strip()

    if _looks_like_question(claim):
        return VerdictResponse(
            id=uuid.uuid4().hex[:10],
            claim=claim,
            verdict="Unverified",
            confidence=0,
            reasoning="That input is phrased as a question. Submit the factual statement you want verified, or use Assistant for a direct question.",
            key_points=[],
            evidence=[],
            created_at=now_iso(),
            latency_ms=int((time.perf_counter() - started) * 1000),
        )

    evidence, used_web_search = await gather_evidence(claim, top_k=settings.TOP_K_RESULTS)

    if evidence:
        context = "\n\n".join(
            f"[{i + 1}] {item['source_type'].upper()} SOURCE: {item['source']}\n{item['snippet']}"
            for i, item in enumerate(evidence)
        )
    else:
        context = "No evidence was retrieved."

    prompt = f"""Claim:
{claim}

Evidence:
{context}

Return exactly:
{{
  "verdict": "True" | "False" | "Misleading" | "Unverified",
  "confidence": <0-100>,
  "reasoning": "<2-4 sentences grounded only in the evidence>",
  "key_points": ["<point>", "<point>"]
}}

Guidance:
- True = evidence supports the central factual claim.
- False = evidence directly contradicts the central factual claim.
- Misleading = the statement mixes truth and falsehood or removes a material qualification.
- Unverified = evidence is insufficient, too weak, or materially conflicting.
- Do not call a claim true merely because related words appear in a source.
- Do not call a claim false merely because the exact sentence is absent.
"""

    try:
        raw = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            json_mode=True,
            reasoning_effort="high",
            max_tokens=900,
            temperature=0.1,
        )
        parsed = _parse_model_output(raw)
    except GroqError as exc:
        parsed = {
            "verdict": "Unverified",
            "confidence": 0,
            "reasoning": str(exc),
            "key_points": [],
        }

    ml_result = None
    try:
        ml_result = adaptive_learner.predict(claim)
    except Exception:
        logger.exception("ML prediction failed")

    result = VerdictResponse(
        id=uuid.uuid4().hex[:10],
        claim=claim,
        verdict=parsed["verdict"],
        confidence=parsed["confidence"],
        reasoning=parsed["reasoning"],
        key_points=parsed["key_points"],
        evidence=[Evidence(**item) for item in evidence],
        used_web_search=used_web_search,
        ml_prediction=MLPrediction(**ml_result) if ml_result else None,
        created_at=now_iso(),
        latency_ms=int((time.perf_counter() - started) * 1000),
    )

    history_service.add(result)

    # Online learning happens only from evidence-backed, high-confidence outcomes.
    try:
        adaptive_learner.maybe_learn(
            claim=claim,
            verdict=result.verdict,
            evidence_count=len(result.evidence),
            verification_confidence=result.confidence,
            used_web_search=result.used_web_search,
        )
    except Exception:
        logger.exception("Adaptive learning skipped after verification")

    return result
