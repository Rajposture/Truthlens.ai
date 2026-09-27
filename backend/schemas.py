from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


# ============================================================
# USER SCHEMAS
# ============================================================

class UserCreate(BaseModel):
    clerk_id: str
    email: str


# ============================================================
# CHAT SCHEMAS
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None
    sources: List[Dict[str, Any]] = Field(default_factory=list)


class ChatSessionSummary(BaseModel):
    session_id: str
    title: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ============================================================
# DOCUMENT SCHEMAS
# ============================================================

class DocumentInfo(BaseModel):
    id: Optional[str] = None
    filename: str
    file_type: Optional[str] = None
    size: Optional[int] = None
    chunks: Optional[int] = None
    status: Optional[str] = None


class KnowledgeStats(BaseModel):
    total_documents: int = 0
    total_chunks: int = 0


# ============================================================
# VERIFICATION SCHEMAS
# ============================================================

class ClaimRequest(BaseModel):
    claim: str = Field(..., min_length=1)


class VerdictResponse(BaseModel):
    verdict: str
    confidence: Optional[float] = None
    explanation: Optional[str] = None
    evidence: List[Dict[str, Any]] = Field(default_factory=list)


# ============================================================
# HISTORY SCHEMAS
# ============================================================

class HistoryClearResponse(BaseModel):
    success: bool
    message: str