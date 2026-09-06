"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Send, Trash2, PanelLeftClose, PanelLeft, Square } from "lucide-react";
import { ApertureMark } from "@/components/brand/ApertureMark";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { IconButton } from "@/components/ui/primitives";
import { streamChatMessage, getChatSession, deleteChatSession, ApiError } from "@/lib/api";
import { cn, formatRelativeTime, generateId } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

interface LocalSession {
  session_id: string;
  title: string;
  updated_at: string;
}

const SESSIONS_KEY = "truthlens.chat.sessions";
const ACTIVE_KEY = "truthlens.chat.active";

const SUGGESTIONS = [
  "What can TruthLens actually verify?",
  "Explain how BM25 retrieval works.",
  "Why does Venus get hotter than Mercury?",
];

export function ChatPanel() {
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ---- bootstrap from localStorage (reads an external source once on mount) ----
  /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from
     localStorage/the backend on mount, not state derived from props/state. */
  useEffect(() => {
    try {
      const storedSessions: LocalSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
      const storedActive = localStorage.getItem(ACTIVE_KEY);
      setSessions(storedSessions);

      if (storedActive) {
        setActiveId(storedActive);
        getChatSession(storedActive)
          .then(setMessages)
          .catch(() => setMessages([]));
      } else {
        setActiveId(generateId());
      }
    } catch {
      setActiveId(generateId());
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  function persistSessions(next: LocalSession[]) {
    setSessions(next);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(next));
  }

  function newChat() {
    abortRef.current?.abort();
    const id = generateId();
    setActiveId(id);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
    localStorage.setItem(ACTIVE_KEY, id);
  }

  async function selectSession(id: string) {
    if (id === activeId) return;
    abortRef.current?.abort();
    setActiveId(id);
    setSidebarOpen(false);
    localStorage.setItem(ACTIVE_KEY, id);
    try {
      setMessages(await getChatSession(id));
    } catch {
      setMessages([]);
    }
  }

  async function removeSession(id: string) {
    try {
      await deleteChatSession(id);
    } catch {
      /* already gone server-side is fine */
    }
    const next = sessions.filter((s) => s.session_id !== id);
    persistSessions(next);
    if (id === activeId) newChat();
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const now = new Date().toISOString();
    const userMessage: ChatMessage = { role: "user", content: trimmed, sources: [], created_at: now };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "", sources: [], created_at: now }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsStreaming(true);

    const existing = sessions.find((s) => s.session_id === activeId);
    const nextSessions = existing
      ? sessions.map((s) => (s.session_id === activeId ? { ...s, updated_at: now } : s))
      : [{ session_id: activeId, title: trimmed.slice(0, 60), updated_at: now }, ...sessions];
    persistSessions(nextSessions);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChatMessage(
        trimmed,
        activeId,
        (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            copy[copy.length - 1] = { ...last, content: last.content + chunk };
            return copy;
          });
        },
        controller.signal
      );
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        const message = err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: message };
          return copy;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          onClick={newChat}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-ink-700 py-2.5 text-sm font-medium text-text-primary transition-colors hover:border-brass-400/50 hover:text-brass-300"
        >
          <Plus size={16} />
          New chat
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {sessions.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-text-faint">Your conversations will appear here.</p>
        )}
        {sessions.map((s) => (
          <div
            key={s.session_id}
            className={cn(
              "group flex items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm transition-colors",
              s.session_id === activeId ? "bg-ink-800 text-paper-100" : "text-text-muted hover:bg-ink-800/60"
            )}
          >
            <button onClick={() => selectSession(s.session_id)} className="min-w-0 flex-1 text-left">
              <p className="truncate">{s.title}</p>
              <p className="text-[11px] text-text-faint">{formatRelativeTime(s.updated_at)}</p>
            </button>
            <button
              onClick={() => removeSession(s.session_id)}
              className="shrink-0 text-text-faint opacity-0 transition-opacity hover:text-false-400 group-hover:opacity-100"
              aria-label="Delete conversation"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl">
      <aside className="hidden w-72 shrink-0 border-r border-ink-800 md:block">{sidebarContent}</aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/70 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-ink-800 bg-ink-950 md:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-ink-800 px-4 py-3 md:hidden">
          <IconButton onClick={() => setSidebarOpen(true)} aria-label="Open conversation list">
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </IconButton>
          <span className="text-sm font-medium text-text-primary">Assistant</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <ApertureMark size={40} />
              <div>
                <h2 className="font-display text-xl font-semibold text-paper-100">Ask TruthLens anything</h2>
                <p className="mt-1.5 max-w-sm text-sm text-text-muted">
                  Grounded answers when your question touches the knowledge base, plain reasoning
                  otherwise.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-ink-700 px-3.5 py-2 text-xs text-text-muted transition-colors hover:border-brass-400/50 hover:text-brass-300"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((m, i) => (
                <ChatMessageBubble key={i} message={m} />
              ))}
              <div ref={threadEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-ink-800 px-4 py-4 sm:px-8">
          <div className="mx-auto flex max-w-3xl items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask a question..."
              className="max-h-40 flex-1 resize-none rounded-[var(--radius-md)] border border-ink-700 bg-ink-950/60 px-4 py-3 text-[15px] text-text-primary placeholder:text-text-faint outline-none focus:border-brass-400/70"
            />
            <button
              onClick={() => (isStreaming ? abortRef.current?.abort() : send(input))}
              disabled={!isStreaming && !input.trim()}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brass-400 text-ink-950 transition-opacity disabled:opacity-40"
              aria-label={isStreaming ? "Stop" : "Send"}
            >
              {isStreaming ? <Square size={16} /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
