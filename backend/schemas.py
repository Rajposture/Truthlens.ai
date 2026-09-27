"""Pydantic contracts shared by every router/service.

These mirror frontend/lib/types.ts field-for-field — keep the two in sync
whenever either side changes.
"""
from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

Verdict = Literal["True", "False", "Misleading", "Unverified"]


# ============================================================
# GENERIC
# ============================================================

class StatusResponse(BaseModel):
    status: str = "success"
    message: str


# ============================================================
# USER (Clerk sync)
# ============================================================

class UserCreate(BaseModel):
    clerk_id: str
    email: str


class UserInfo(BaseModel):
    clerk_id: str
    email: str
    created_at: str


# ============================================================
# CHAT
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None
    sources: List[str] = Field(default_factory=list)


class ChatSessionSummary(BaseModel):
    session_id: str
    title: Optional[str] = None
    updated_at: Optional[str] = None
    message_count: int = 0


# ============================================================
# DOCUMENTS / KNOWLEDGE BASE
# ============================================================

class DocumentInfo(BaseModel):
    id: str
    filename: str
    chunks: int = 0
    size_kb: float = 0
    uploaded_at: str


class KnowledgeStats(BaseModel):
    documents: int = 0
    chunks: int = 0
    seeded: bool = False


# ============================================================
# VERIFICATION
# ============================================================

class ClaimRequest(BaseModel):
    claim: str = Field(..., min_length=1)


class Evidence(BaseModel):
    source: str
    snippet: str
    relevance: float
    source_type: Literal["knowledge_base", "web"]
    url: Optional[str] = None
    keyword_overlap: Optional[float] = None


class MLPrediction(BaseModel):
    verdict: Verdict
    confidence: Optional[float] = None
    confidence_level: Literal["High", "Medium", "Low"] = "Low"
    uncertain: bool = True
    probabilities: Dict[str, float] = Field(default_factory=dict)
    model: Optional[str] = None
    model_version: Optional[str] = None
    training_samples: Optional[int] = None
    adaptive_samples: int = 0


class VerdictResponse(BaseModel):
    id: str
    claim: str
    verdict: Verdict
    confidence: int
    reasoning: str
    key_points: List[str] = Field(default_factory=list)
    evidence: List[Evidence] = Field(default_factory=list)
    used_web_search: bool = False
    ml_prediction: Optional[MLPrediction] = None
    created_at: str
    latency_ms: int = 0


# ============================================================
# HISTORY
# ============================================================

class HistoryClearResponse(StatusResponse):
    pass
