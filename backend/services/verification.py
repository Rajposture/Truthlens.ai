"""Turns a claim into a grounded, evidence-based verdict."""
from __future__ import annotations

import json
import re
import time
import uuid

from config import settings
from knowledge_base import knowledge_base
from llm import GroqError, chat
from schemas import Evidence, VerdictResponse
from services.history import history_service
from utils import now_iso

SYSTEM_PROMPT = """You are the verification engine inside TruthLens AI, a fact-checking assistant.
Judge claims strictly using the evidence you are given below - never your own outside assumptions.
Be precise, neutral, and evidence-driven. If the evidence doesn't clearly settle the claim, choose
"Unverified" rather than guessing. Respond with a single valid JSON object and nothing else: no
markdown code fences, no commentary before or after it."""

_QUESTION_STARTERS = {
    "what", "why", "how", "when", "where", "who", "whom", "whose", "which",
    "is", "are", "can", "could", "should", "would", "will", "do", "does",
    "did", "has", "have", "had",
}
_LEADING_WORD = re.compile(r"[a-zA-Z']+")

_VALID_VERDICTS = {"True", "False", "Misleading", "Unverified"}


def _looks_like_question(claim: str) -> bool:
    stripped = claim.strip()
    if stripped.endswith("?"):
        return True
    match = _LEADING_WORD.match(stripped)
    return bool(match and match.group(0).lower() in _QUESTION_STARTERS)


def _parse_model_output(raw: str) -> dict:
    data = None
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
            except json.JSONDecodeError:
                data = None

    if not isinstance(data, dict):
        return {
            "verdict": "Unverified",
            "confidence": 0,
            "reasoning": "The AI's response could not be parsed. Please try again.",
            "key_points": [],
        }

    verdict = str(data.get("verdict", "Unverified")).strip().capitalize()
    if verdict not in _VALID_VERDICTS:
        verdict = "Unverified"

    try:
        confidence = int(round(float(data.get("confidence", 0))))
    except (TypeError, ValueError):
        confidence = 0
    confidence = max(0, min(100, confidence))

    reasoning = str(data.get("reasoning") or "No reasoning was provided.").strip()

    key_points = data.get("key_points") or []
    if not isinstance(key_points, list):
        key_points = []
    key_points = [str(p).strip() for p in key_points if str(p).strip()][:3]

    return {"verdict": verdict, "confidence": confidence, "reasoning": reasoning, "key_points": key_points}


async def verify_claim(claim: str) -> VerdictResponse:
    started = time.perf_counter()
    claim = claim.strip()

    if _looks_like_question(claim):
        return VerdictResponse(
            id=uuid.uuid4().hex[:10],
            claim=claim,
            verdict="Unverified",
            confidence=0,
            reasoning="That reads like a question rather than a factual claim. "
            "Ask it in the AI Assistant tab and I'll answer it directly.",
            key_points=[],
            evidence=[],
            created_at=now_iso(),
            latency_ms=int((time.perf_counter() - started) * 1000),
        )

    evidence = knowledge_base.search(claim, top_k=settings.TOP_K_RESULTS)

    if evidence:
        context = "\n\n".join(
            f"[{i + 1}] Source: {item['source']}\n{item['snippet']}" for i, item in enumerate(evidence)
        )
    else:
        context = "No matching evidence was found in the knowledge base."

    user_prompt = f"""Claim to verify: "{claim}"

Evidence retrieved from the knowledge base:
{context}

Return ONLY a JSON object with this exact shape:
{{"verdict": "True" | "False" | "Misleading" | "Unverified", "confidence": <integer 0-100>, \
"reasoning": "<2-4 sentence explanation grounded only in the evidence above>", "key_points": \
["<short supporting point>", "..."]}}

Rules:
- Base your verdict only on the evidence above, not prior knowledge.
- If the evidence is empty, contradictory, or insufficient, use "Unverified" with low confidence.
- key_points should contain at most 3 short items.
- Output raw JSON only - no markdown fences, no extra text."""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    try:
        raw = await chat(messages, json_mode=True, reasoning_effort="medium", max_tokens=700, temperature=0.15)
        parsed = _parse_model_output(raw)
    except GroqError as exc:
        parsed = {"verdict": "Unverified", "confidence": 0, "reasoning": str(exc), "key_points": []}

    result = VerdictResponse(
        id=uuid.uuid4().hex[:10],
        claim=claim,
        verdict=parsed["verdict"],
        confidence=parsed["confidence"],
        reasoning=parsed["reasoning"],
        key_points=parsed["key_points"],
        evidence=[Evidence(**item) for item in evidence],
        created_at=now_iso(),
        latency_ms=int((time.perf_counter() - started) * 1000),
    )

    history_service.add(result)
    return result
