"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Send,
  Trash2,
  Plus,
  Paperclip,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const bottomRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existing =
      localStorage.getItem(
        "truthlens_session"
      );

    if (existing) {
      setSessionId(existing);
    } else {
      const id =
        crypto.randomUUID();

      localStorage.setItem(
        "truthlens_session",
        id
      );

      setSessionId(id);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage() {
    if (!input.trim()) return;

    const question = input;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response =
        await fetch(
          "http://localhost:8000/chat",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              message: question,
              session_id: sessionId,
            }),
          }
        );

      const data =
        await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          sources:
            data.sources || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to backend.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    try {
      await fetch(
        "http://localhost:8000/chat/history",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
          }),
        }
      );
    } catch {}

    setMessages([
      {
        role: "assistant",
        content:
          "How can I help you today?",
      },
    ]);
  }

  function createNewChat() {
    const id =
      crypto.randomUUID();

    localStorage.setItem(
      "truthlens_session",
      id
    );

    setSessionId(id);

    setMessages([
      {
        role: "assistant",
        content:
          "How can I help you today?",
      },
    ]);
  }

  async function uploadFile(
    file: File
  ) {
    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    try {
      await fetch(
        "http://localhost:8000/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `Uploaded **${file.name}** successfully.`,
        },
      ]);
    } catch {
      alert(
        "Upload failed."
      );
    }
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex h-[calc(100vh-120px)] max-w-5xl flex-col">

        {/* Top Bar */}

        <div className="mb-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-semibold">
              AI Assistant
            </h1>

            <p className="text-sm text-zinc-500">
              Powered by Ollama + RAG
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={createNewChat}
              className="
                flex items-center gap-2
                rounded-xl
                border border-zinc-800
                px-4 py-2
                hover:bg-zinc-900
              "
            >
              <Plus size={16} />
              New Chat
            </button>

            <button
              onClick={clearChat}
              className="
                flex items-center gap-2
                rounded-xl
                border border-zinc-800
                px-4 py-2
                hover:bg-zinc-900
              "
            >
              <Trash2 size={16} />
              Clear
            </button>

          </div>

        </div>

        {/* Chat Area */}

        <div
          className="
            flex-1
            overflow-y-auto
            rounded-3xl
            border border-zinc-800
            bg-zinc-950
            p-8
          "
        >

          <div className="space-y-8">

            {messages.map(
              (
                message,
                index
              ) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-3xl
                      rounded-3xl
                      px-5 py-4
                      ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-900"
                      }
                    `}
                  >
                    <ReactMarkdown
                      remarkPlugins={[
                        remarkGfm,
                      ]}
                    >
                      {message.content}
                    </ReactMarkdown>

                    {message.sources &&
                      message.sources.length >
                        0 && (
                        <div className="mt-4 border-t border-zinc-800 pt-3">

                          <p className="mb-2 text-xs text-zinc-500">
                            Sources
                          </p>

                          {message.sources.map(
                            (
                              source,
                              idx
                            ) => (
                              <div
                                key={idx}
                                className="text-xs text-cyan-400"
                              >
                                {source}
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="flex">
                <div
                  className="
                    flex items-center gap-2
                    rounded-3xl
                    bg-zinc-900
                    px-5 py-4
                  "
                >
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:150ms]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />

          </div>

        </div>

        {/* Composer */}

        <div className="mt-6">

          <div
            className="
              flex items-center gap-3
              rounded-3xl
              border border-zinc-800
              bg-zinc-950
              p-3
            "
          >

            <button
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="
                rounded-xl
                p-3
                hover:bg-zinc-900
              "
            >
              <Paperclip size={18} />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              hidden
              onChange={(e) => {
                const file =
                  e.target.files?.[0];

                if (file)
                  uploadFile(file);
              }}
            />

            <textarea
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              rows={1}
              placeholder="Ask anything..."
              className="
                flex-1
                resize-none
                bg-transparent
                outline-none
              "
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="
                rounded-xl
                bg-blue-600
                p-3
                hover:bg-blue-500
              "
            >
              <Send size={18} />
            </button>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}