export type Verdict = "True" | "False" | "Misleading" | "Unverified";

export interface Evidence {
  source: string;
  snippet: string;
  relevance: number;
}

export interface VerdictResult {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  key_points: string[];
  evidence: Evidence[];
  created_at: string;
  latency_ms: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources: string[];
  created_at: string;
}

export interface ChatSessionSummary {
  session_id: string;
  title: string;
  updated_at: string;
  message_count: number;
}

export interface DocumentInfo {
  id: string;
  filename: string;
  chunks: number;
  size_kb: number;
  uploaded_at: string;
}

export interface KnowledgeStats {
  documents: number;
  chunks: number;
  seeded: boolean;
}

export interface HealthStatus {
  status: string;
  groq_configured: boolean;
  groq_model: string;
  knowledge_base: KnowledgeStats;
}
