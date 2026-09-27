export type Verdict = "True" | "False" | "Misleading" | "Unverified";

export interface Evidence {
  source: string;
  snippet: string;
  relevance: number;
  source_type: "knowledge_base" | "web";
  url: string | null;
}

export interface MLPrediction {
  verdict: Verdict;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface VerdictResult {
  id: string;
  claim: string;
  verdict: Verdict;
  confidence: number;
  reasoning: string;
  key_points: string[];
  evidence: Evidence[];
  used_web_search: boolean;
  ml_prediction: MLPrediction | null;
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
  llm_provider: string;
  groq_configured: boolean;
  groq_model: string;
  ollama_model: string | null;
  knowledge_base: KnowledgeStats;
}
