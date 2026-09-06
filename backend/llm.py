"""
Async client for Groq's OpenAI-compatible chat completions API.

Groq runs open models (we default to `openai/gpt-oss-120b`) on custom LPU
hardware, which is why responses stream back noticeably faster than most
GPU-hosted APIs — this is the whole reason TruthLens feels instant. Get a
free key in seconds at https://console.groq.com/keys and set GROQ_API_KEY.

Both `openai/gpt-oss-120b` and `openai/gpt-oss-20b` are reasoning models:
by default they think before answering and return that chain-of-thought in
a separate `reasoning` field. We turn that off (`include_reasoning: False`)
so `content` is always the clean final answer.
"""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator

import httpx

from config import settings

logger = logging.getLogger("truthlens.llm")


class GroqError(RuntimeError):
    """Raised whenever the LLM can't produce a usable answer."""


def _require_api_key() -> None:
    if not settings.GROQ_API_KEY:
        raise GroqError(
            "GROQ_API_KEY is not set. Add a free key from "
            "https://console.groq.com/keys to your .env file and restart the server."
        )


def _payload(
    messages: list[dict],
    *,
    stream: bool,
    json_mode: bool,
    reasoning_effort: str | None,
    max_tokens: int,
    temperature: float,
) -> dict:
    payload: dict = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_completion_tokens": max_tokens,
        "top_p": 0.95,
        "stream": stream,
        "include_reasoning": False,
        "reasoning_effort": reasoning_effort or settings.GROQ_REASONING_EFFORT,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}
    return payload


async def chat(
    messages: list[dict],
    *,
    json_mode: bool = False,
    reasoning_effort: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.4,
) -> str:
    """Single-shot (non-streaming) completion. Returns the final answer text."""
    _require_api_key()

    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = _payload(
        messages,
        stream=False,
        json_mode=json_mode,
        reasoning_effort=reasoning_effort,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    last_error: Exception | None = None
    async with httpx.AsyncClient(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
        for attempt in range(2):
            try:
                response = await client.post(url, headers=headers, json=body)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                if not content or not content.strip():
                    raise GroqError("The model returned an empty response.")
                return content.strip()
            except httpx.HTTPStatusError as exc:
                detail = exc.response.text[:300]
                logger.warning("Groq HTTP %s: %s", exc.response.status_code, detail)
                if exc.response.status_code in (401, 403):
                    raise GroqError(
                        "Groq rejected the API key. Double-check GROQ_API_KEY in your .env."
                    ) from exc
                if exc.response.status_code == 429:
                    raise GroqError(
                        "Groq rate limit reached. Wait a few seconds and try again."
                    ) from exc
                last_error = exc
            except (httpx.TimeoutException, httpx.RequestError) as exc:
                logger.warning("Groq request failed (attempt %d): %s", attempt + 1, exc)
                last_error = exc

    raise GroqError("TruthLens's AI engine is temporarily unavailable. Please try again.") from last_error


async def chat_stream(
    messages: list[dict],
    *,
    reasoning_effort: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.5,
) -> AsyncGenerator[str, None]:
    """Yields response text incrementally as it's generated."""
    _require_api_key()

    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = _payload(
        messages,
        stream=True,
        json_mode=False,
        reasoning_effort=reasoning_effort,
        max_tokens=max_tokens,
        temperature=temperature,
    )

    async with httpx.AsyncClient(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
        try:
            async with client.stream("POST", url, headers=headers, json=body) as response:
                if response.status_code != 200:
                    error_bytes = await response.aread()
                    logger.warning("Groq stream HTTP %s: %s", response.status_code, error_bytes[:300])
                    raise GroqError("TruthLens's AI engine is temporarily unavailable. Please try again.")

                async for line in response.aiter_lines():
                    if not line or not line.startswith("data:"):
                        continue
                    payload = line[len("data:"):].strip()
                    if payload == "[DONE]":
                        break
                    try:
                        chunk = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    delta = chunk.get("choices", [{}])[0].get("delta", {})
                    text = delta.get("content")
                    if text:
                        yield text
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            logger.warning("Groq stream request failed: %s", exc)
            raise GroqError("TruthLens's AI engine is temporarily unavailable. Please try again.") from exc
