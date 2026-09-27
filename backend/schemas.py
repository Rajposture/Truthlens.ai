"""Pydantic request/response models shared across routers."""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Verdict = Literal["True", "False", "Misleading", "Unverified"]


# ---------- Verification ----------

class ClaimRequest(BaseModel):
    claim: str = Field(..., min_length=1, max_length=2000)


class Evidence(BaseModel):
    source: str
    snippet: str
    relevance: float
    source_type: Literal["knowledge_base", "web"] = "knowledge_base"
    url: str | None = None


class MLPrediction(BaseModel):
    """Output of the offline-trained TF-IDF + classifier (see backend/ml_classifier.py),
    trained on the LIAR dataset. Independent of the RAG + LLM verdict below - a second,
    genuinely trained signal, not a duplicate of it."""

    verdict: Verdict
    confidence: float
    probabilities: dict[str, float] = Field(default_factory=dict)


class VerdictResponse(BaseModel):
    id: str
    claim: str
    verdict: Verdict
    confidence: int
    reasoning: str
    key_points: list[str] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    used_web_search: bool = False
    ml_prediction: MLPrediction | None = None
    created_at: str
    latency_ms: int


# ---------- Chat ----------

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: str = Field(..., min_length=1, max_length=128)


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    sources: list[str] = Field(default_factory=list)
    created_at: str


class ChatResponse(BaseModel):
    response: str
    sources: list[str] = Field(default_factory=list)
    session_id: str


class ChatSessionSummary(BaseModel):
    session_id: str
    title: str
    updated_at: str
    message_count: int


# ---------- Documents / knowledge base ----------

class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunks: int
    size_kb: float
    uploaded_at: str


class KnowledgeStats(BaseModel):
    documents: int
    chunks: int
    seeded: bool


# ---------- History ----------

class HistoryClearResponse(BaseModel):
    status: str
    message: str
