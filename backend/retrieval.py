"""
Single entry point for "get me evidence for this query."

Strategy: always check the local knowledge base first (free, instant). Only
reach out to the web when the local base doesn't have enough strong matches -
this keeps the common case fast and free, and reserves the Tavily quota for
claims the seeded facts and your uploads genuinely can't answer.
"""
from __future__ import annotations

from config import settings
from knowledge_base import knowledge_base
from web_search import search_web


async def gather_evidence(query: str, top_k: int | None = None) -> tuple[list[dict], bool]:
    """Returns (evidence, used_web_search)."""
    top_k = top_k or settings.TOP_K_RESULTS
    local = knowledge_base.search(query, top_k=top_k)

    strong_local = [
        e
        for e in local
        if e["relevance"] >= settings.WEB_SEARCH_RELEVANCE_THRESHOLD
        and e.get("keyword_overlap", 0) >= settings.WEB_SEARCH_MIN_KEYWORD_OVERLAP
    ]
    if len(strong_local) >= settings.WEB_SEARCH_MIN_STRONG_MATCHES or not settings.TAVILY_API_KEY:
        return local, False

    web_results = await search_web(query)
    if not web_results:
        return local, False

    combined = sorted(strong_local + web_results, key=lambda e: e["relevance"], reverse=True)
    return combined[:top_k], True
