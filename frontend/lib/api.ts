import type {
  ChatMessage,
  ChatSessionSummary,
  DocumentInfo,
  HealthStatus,
  KnowledgeStats,
  VerdictResult,
} from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    if (Array.isArray(body?.detail)) {
      return body.detail.map((d: { msg?: string }) => d.msg).join(", ") || fallback;
    }
    return body?.detail || fallback;
  } catch {
    return fallback;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    });
  } catch {
    throw new ApiError(
      "Can't reach the TruthLens backend. Check that it's running and NEXT_PUBLIC_API_URL is set correctly."
    );
  }
  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res, `Request failed (${res.status}).`));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- Verification ----------

export function verifyClaim(claim: string) {
  return request<VerdictResult>("/api/verify", {
    method: "POST",
    body: JSON.stringify({ claim }),
  });
}

// ---------- Chat ----------

export function sendChatMessage(message: string, sessionId: string) {
  return request<{ response: string; sources: string[]; session_id: string }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

export async function streamChatMessage(
  message: string,
  sessionId: string,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: sessionId }),
      signal,
    });
  } catch {
    throw new ApiError(
      "Can't reach the TruthLens backend. Check that it's running and NEXT_PUBLIC_API_URL is set correctly."
    );
  }

  if (!res.ok || !res.body) {
    throw new ApiError(await extractErrorMessage(res, "The assistant is temporarily unavailable."));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) onChunk(decoder.decode(value, { stream: true }));
  }
}

export function getChatSessions() {
  return request<ChatSessionSummary[]>("/api/chat/sessions");
}

export function getChatSession(sessionId: string) {
  return request<ChatMessage[]>(`/api/chat/sessions/${sessionId}`);
}

export function deleteChatSession(sessionId: string) {
  return request<void>(`/api/chat/sessions/${sessionId}`, { method: "DELETE" });
}

// ---------- Knowledge base ----------

export async function uploadDocument(file: File): Promise<DocumentInfo> {
  const form = new FormData();
  form.append("file", file);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/documents/upload`, { method: "POST", body: form });
  } catch {
    throw new ApiError("Can't reach the TruthLens backend right now.");
  }
  if (!res.ok) {
    throw new ApiError(await extractErrorMessage(res, "Upload failed."));
  }
  return res.json() as Promise<DocumentInfo>;
}

export function getDocuments() {
  return request<DocumentInfo[]>("/api/documents");
}

export function getKnowledgeStats() {
  return request<KnowledgeStats>("/api/documents/stats");
}

export function deleteDocument(docId: string) {
  return request<void>(`/api/documents/${docId}`, { method: "DELETE" });
}

export function clearKnowledgeBase() {
  return request<void>("/api/documents", { method: "DELETE" });
}

// ---------- History ----------

export function getHistory(limit = 100) {
  return request<VerdictResult[]>(`/api/history?limit=${limit}`);
}

export function clearHistory() {
  return request<void>("/api/history", { method: "DELETE" });
}

// ---------- Health ----------

export function getHealth() {
  return request<HealthStatus>("/api/health");
}
