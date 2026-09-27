"""
LLM client supporting two providers behind one interface: chat() and chat_stream().

- "groq"   -> cloud, works anywhere (including Railway/Vercel deployment). Needs GROQ_API_KEY.
- "ollama" -> local model on your own machine (e.g. Phi-3). Needs Ollama running at
              OLLAMA_BASE_URL. This CANNOT be reached from Railway/Vercel unless Ollama
              is itself deployed and reachable from there - use this for local dev/demo,
              and switch LLM_PROVIDER back to "groq" for the deployed version.

Switch providers with the LLM_PROVIDER env var - no other code changes needed.
"""
from __future__ import annotations

import json
import logging
from collections.abc import AsyncGenerator

import httpx

from config import settings

logger = logging.getLogger("truthlens.llm")


class GroqError(RuntimeError):
    """Raised whenever the LLM can't produce a usable answer. Name kept for
    backward compatibility with existing call sites; it now covers both providers."""


# ---------------------------------------------------------------------------
# Groq (cloud)
# ---------------------------------------------------------------------------

def _require_groq_key() -> None:
    if not settings.GROQ_API_KEY:
        raise GroqError(
            "GROQ_API_KEY is not set. Add a free key from "
            "https://console.groq.com/keys to your .env file and restart the server."
        )


def _groq_payload(
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


async def _groq_chat(
    messages: list[dict],
    *,
    json_mode: bool,
    reasoning_effort: str | None,
    max_tokens: int,
    temperature: float,
) -> str:
    _require_groq_key()

    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = _groq_payload(
        messages, stream=False, json_mode=json_mode, reasoning_effort=reasoning_effort,
        max_tokens=max_tokens, temperature=temperature,
    )

    last_error: Exception | None = None
    async with httpx.AsyncClient(timeout=settings.GROQ_TIMEOUT_SECONDS) as client:
        for _ in range(2):
            try:
                response = await client.post(url, headers=headers, json=body)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                if not content or not content.strip():
                    raise GroqError("The model returned an empty response.")
                return content.strip()
            except httpx.HTTPStatusError as exc:
                logger.warning("Groq HTTP %s: %s", exc.response.status_code, exc.response.text[:300])
                if exc.response.status_code in (401, 403):
                    raise GroqError(
                        "Groq rejected the API key. Double-check GROQ_API_KEY in your .env."
                    ) from exc
                if exc.response.status_code == 429:
                    raise GroqError("Groq rate limit reached. Wait a few seconds and try again.") from exc
                last_error = exc
            except (httpx.TimeoutException, httpx.RequestError) as exc:
                logger.warning("Groq request failed: %s", exc)
                last_error = exc

    raise GroqError("TruthLens's AI engine is temporarily unavailable. Please try again.") from last_error


async def _groq_chat_stream(
    messages: list[dict], *, reasoning_effort: str | None, max_tokens: int, temperature: float,
) -> AsyncGenerator[str, None]:
    _require_groq_key()

    url = f"{settings.GROQ_BASE_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    body = _groq_payload(
        messages, stream=True, json_mode=False, reasoning_effort=reasoning_effort,
        max_tokens=max_tokens, temperature=temperature,
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


# ---------------------------------------------------------------------------
# Ollama (local)
# ---------------------------------------------------------------------------

async def _ollama_chat(messages: list[dict], *, json_mode: bool, max_tokens: int, temperature: float) -> str:
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    body: dict = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature, "num_predict": max_tokens},
    }
    if json_mode:
        body["format"] = "json"

    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            response = await client.post(url, json=body)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("Ollama HTTP %s: %s", exc.response.status_code, exc.response.text[:300])
        raise GroqError(
            f"Ollama returned an error. Is the '{settings.OLLAMA_MODEL}' model pulled? "
            f"Run: ollama pull {settings.OLLAMA_MODEL}"
        ) from exc
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        logger.warning("Ollama request failed: %s", exc)
        raise GroqError(
            f"Can't reach Ollama at {settings.OLLAMA_BASE_URL}. Is `ollama serve` running locally? "
            "(Note: Ollama only works when running TruthLens locally, not on Railway/Vercel - "
            "set LLM_PROVIDER=groq for the deployed version.)"
        ) from exc

    content = data.get("message", {}).get("content", "")
    if not content.strip():
        raise GroqError("Ollama returned an empty response.")
    return content.strip()


async def _ollama_chat_stream(
    messages: list[dict], *, max_tokens: int, temperature: float,
) -> AsyncGenerator[str, None]:
    url = f"{settings.OLLAMA_BASE_URL}/api/chat"
    body = {
        "model": settings.OLLAMA_MODEL,
        "messages": messages,
        "stream": True,
        "options": {"temperature": temperature, "num_predict": max_tokens},
    }

    try:
        async with httpx.AsyncClient(timeout=settings.OLLAMA_TIMEOUT_SECONDS) as client:
            async with client.stream("POST", url, json=body) as response:
                if response.status_code != 200:
                    error_bytes = await response.aread()
                    logger.warning("Ollama stream HTTP %s: %s", response.status_code, error_bytes[:300])
                    raise GroqError(
                        f"Ollama returned an error. Is the '{settings.OLLAMA_MODEL}' model pulled?"
                    )
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    text = chunk.get("message", {}).get("content")
                    if text:
                        yield text
                    if chunk.get("done"):
                        break
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        logger.warning("Ollama stream request failed: %s", exc)
        raise GroqError(
            f"Can't reach Ollama at {settings.OLLAMA_BASE_URL}. Is `ollama serve` running locally?"
        ) from exc


# ---------------------------------------------------------------------------
# Public interface - unchanged signatures, dispatches by provider
# ---------------------------------------------------------------------------

async def chat(
    messages: list[dict],
    *,
    json_mode: bool = False,
    reasoning_effort: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.4,
) -> str:
    """Single-shot (non-streaming) completion. Returns the final answer text."""
    if settings.LLM_PROVIDER == "ollama":
        return await _ollama_chat(messages, json_mode=json_mode, max_tokens=max_tokens, temperature=temperature)
    return await _groq_chat(
        messages, json_mode=json_mode, reasoning_effort=reasoning_effort,
        max_tokens=max_tokens, temperature=temperature,
    )


async def chat_stream(
    messages: list[dict],
    *,
    reasoning_effort: str | None = None,
    max_tokens: int = 1024,
    temperature: float = 0.5,
) -> AsyncGenerator[str, None]:
    """Yields response text incrementally as it's generated."""
    if settings.LLM_PROVIDER == "ollama":
        async for chunk in _ollama_chat_stream(messages, max_tokens=max_tokens, temperature=temperature):
            yield chunk
        return

    async for chunk in _groq_chat_stream(
        messages, reasoning_effort=reasoning_effort, max_tokens=max_tokens, temperature=temperature
    ):
        yield chunk
