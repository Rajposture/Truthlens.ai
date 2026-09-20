"""
Live web search, used only when the local knowledge base doesn't have enough
evidence to responsibly answer. Powered by Tavily (https://tavily.com), an
API built specifically for feeding LLM/RAG pipelines clean, pre-summarized
results instead of raw HTML.

This is entirely optional. If TAVILY_API_KEY isn't set, search_web() just
returns an empty list and TruthLens behaves exactly as it did before -
knowledge-base-only.
"""
from __future__ import annotations

import logging

import httpx

from config import settings

logger = logging.getLogger("truthlens.web_search")

TAVILY_URL = "https://api.tavily.com/search"


async def search_web(query: str, max_results: int | None = None) -> list[dict]:
    if not settings.TAVILY_API_KEY:
        return []

    payload = {
        "query": query,
        "search_depth": "basic",
        "max_results": max_results or settings.WEB_SEARCH_MAX_RESULTS,
        "include_answer": False,
        "include_raw_content": False,
    }
    headers = {
        "Authorization": f"Bearer {settings.TAVILY_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=settings.WEB_SEARCH_TIMEOUT_SECONDS) as client:
            response = await client.post(TAVILY_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as exc:
        logger.warning("Tavily search failed: HTTP %s - %s", exc.response.status_code, exc.response.text[:200])
        return []
    except (httpx.TimeoutException, httpx.RequestError) as exc:
        logger.warning("Tavily search failed: %s", exc)
        return []

    results: list[dict] = []
    for item in data.get("results", []):
        content = (item.get("content") or "").strip()
        if not content:
            continue
        score = item.get("score")
        relevance = round(float(score) * 100, 1) if isinstance(score, (int, float)) else 55.0
        results.append(
            {
                "source": item.get("title") or item.get("url") or "Web result",
                "snippet": content[:600],
                "relevance": relevance,
                "source_type": "web",
                "url": item.get("url"),
            }
        )
    return results
