"use client";

import { useState, useRef, useEffect } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Bot,
  User,
  Send,
  Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {

  const [messages, setMessages] =
    useState<Message[]>([
      {
        role: "assistant",
        content:
          `# Welcome to TruthLens Assistant

I can help with:

- Python
- FastAPI
- React
- Next.js
- Java
- Debugging
- Document Analysis
- RAG Questions

Ask me anything.`,
      },
    ]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

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
            }),
          }
        );

      const data =
        await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response ??
            "No response received.",
        },
      ]);

    } catch (error) {

      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Unable to connect to TruthLens backend.",
        },
      ]);

    } finally {

      setLoading(false);

    }
  }

  return (
    <DashboardLayout>

      <div className="flex h-[calc(100vh-40px)] flex-col">

        {/* Header */}

        <div
          className="
            mb-6
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-4xl font-bold">
                TruthLens Assistant
              </h1>

              <p className="mt-2 text-zinc-500">
                AI Coding, Debugging &
                Document Intelligence
              </p>

            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-cyan-900
                bg-cyan-950/20
                px-4
                py-2
              "
            >
              <Sparkles
                className="
                  h-4
                  w-4
                  text-cyan-400
                "
              />

              <span>
                AI Online
              </span>

            </div>

          </div>

        </div>

        {/* Chat */}

        <div
          className="
            flex-1
            overflow-y-auto
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
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
                  className={`
                    flex gap-4
                    ${
                      message.role === "user"
                        ? "justify-end"
                        : "justify-start"
                    }
                  `}
                >

                  {message.role ===
                    "assistant" && (

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-cyan-600
                      "
                    >
                      <Bot
                        className="
                          h-5
                          w-5
                        "
                      />
                    </div>

                  )}

                  <div
                    className={`
                      max-w-4xl
                      overflow-hidden
                      rounded-2xl
                      px-6
                      py-4
                      ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-900 text-zinc-200"
                      }
                    `}
                  >

                    <div
                      className="
                        prose
                        prose-invert
                        max-w-none
                      "
                    >
                      <ReactMarkdown
                        remarkPlugins={[
                          remarkGfm,
                        ]}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>

                  </div>

                  {message.role ===
                    "user" && (

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-blue-600
                      "
                    >
                      <User
                        className="
                          h-5
                          w-5
                        "
                      />
                    </div>

                  )}

                </div>

              )
            )}

            {loading && (

              <div className="flex gap-4">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-600
                  "
                >
                  <Bot
                    className="
                      h-5
                      w-5
                    "
                  />
                </div>

                <div
                  className="
                    rounded-2xl
                    bg-zinc-900
                    px-6
                    py-4
                  "
                >
                  Thinking...
                </div>

              </div>

            )}

            <div
              ref={messagesEndRef}
            />

          </div>

        </div>

        {/* Input */}

        <div className="mt-6">

          <div
            className="
              flex
              gap-3
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-950
              p-3
            "
          >

            <input
              value={input}
              onChange={(e) =>
                setInput(
                  e.target.value
                )
              }
              onKeyDown={(e) => {

                if (
                  e.key === "Enter" &&
                  !loading
                ) {

                  sendMessage();

                }

              }}
              placeholder="
                Ask about code,
                debugging,
                PDFs,
                AI,
                or anything...
              "
              className="
                flex-1
                bg-transparent
                px-3
                outline-none
              "
            />

            <button
              onClick={
                sendMessage
              }
              disabled={
                loading
              }
              className="
                rounded-xl
                bg-blue-600
                px-5
                py-3
                transition
                hover:bg-blue-500
                disabled:opacity-50
              "
            >
              <Send
                className="
                  h-4
                  w-4
                "
              />
            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}