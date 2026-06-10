"use client";

import { useEffect, useRef, useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ChatComposer from "./ChatComposer";
import MessageBubble from "./MessageBubble";
import VideoBackground from "./VideoBackground";

import { Message } from "./types";

import {
Plus,
Trash2,
} from "lucide-react";

export default function ChatPage() {
const [messages, setMessages] =
useState<Message[]>([
{
id: crypto.randomUUID(),
role: "assistant",
content:
"How can I help you today?",
createdAt: new Date(),
},
]);

const [input, setInput] =
useState("");

const [loading, setLoading] =
useState(false);

const [sessionId, setSessionId] =
useState("");

const [attachments, setAttachments] =
useState<File[]>([]);

const bottomRef =
useRef<HTMLDivElement>(null);

useEffect(() => {
const existing =
localStorage.getItem(
"truthlens_session"
);

if (existing) {
  setSessionId(existing);
  return;
}

const id =
  crypto.randomUUID();

localStorage.setItem(
  "truthlens_session",
  id
);

setSessionId(id);


}, []);

useEffect(() => {
bottomRef.current?.scrollIntoView({
behavior: "smooth",
});
}, [messages, loading]);

async function uploadAttachments() {
if (
attachments.length === 0
)
return;


for (const file of attachments) {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  await fetch(
    "http://localhost:8000/documents/upload",
    {
      method: "POST",
      body: formData,
    }
  );
}

}

async function sendMessage() {
const hasPrompt =
input.trim().length > 0;


const hasFiles =
  attachments.length > 0;

if (
  !hasPrompt &&
  !hasFiles
)
  return;

const prompt =
  input.trim() ||
  "Analyze uploaded documents";

setMessages((prev) => [
  ...prev,
  {
    id: crypto.randomUUID(),
    role: "user",
    content: prompt,
    createdAt: new Date(),
  },
]);

setLoading(true);

try {
  await uploadAttachments();

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
          message: prompt,
          session_id:
            sessionId,
        }),
      }
    );

  const data =
    await response.json();

  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        data.response ||
        "No response returned.",
      sources:
        data.sources || [],
      createdAt:
        new Date(),
    },
  ]);

  setInput("");
  setAttachments([]);
} catch {
  setMessages((prev) => [
    ...prev,
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "Unable to connect to backend.",
      createdAt:
        new Date(),
    },
  ]);
} finally {
  setLoading(false);
}


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
    id: crypto.randomUUID(),
    role: "assistant",
    content:
      "How can I help you today?",
    createdAt:
      new Date(),
  },
]);

setInput("");
setAttachments([]);


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
session_id:
sessionId,
}),
}
);
} catch {}


setMessages([
  {
    id: crypto.randomUUID(),
    role: "assistant",
    content:
      "How can I help you today?",
    createdAt:
      new Date(),
  },
]);


}

return ( <DashboardLayout> <VideoBackground />


  <div
    className="
      relative
      z-10
      flex
      h-full
      flex-col
      text-white
    "
  >
    {/* Header */}

    <div
      className="
        mb-6
        flex
        items-center
        justify-between
      "
    >
      <div>
        <h1
          className="
            text-2xl
            font-semibold
          "
        >
          AI 
        </h1>

        <p
          className="
            text-sm
            text-white/60
          "
        >
          Knowledge Workspace
        </p>
      </div>

      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <button
          onClick={
            createNewChat
          }
          className="
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-4
            py-2
            backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            New Chat
          </div>
        </button>

        <button
          onClick={
            clearChat
          }
          className="
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-4
            py-2
            backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-2">
            <Trash2 size={16} />
            Clear
          </div>
        </button>
      </div>
    </div>

    {/* Messages */}

    <main
      className="
        flex-1
        overflow-y-auto
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
          pb-10
        "
      >
        <div
          className="
            space-y-8
          "
        >
          {messages.map(
            (
              message
            ) => (
              <MessageBubble
                key={
                  message.id
                }
                message={
                  message
                }
              />
            )
          )}

          {loading && (
            <div className="flex">
              <div
                className="
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-5
                  py-4
                  backdrop-blur-xl
                "
              >
                Thinking...
              </div>
            </div>
          )}

          <div
            ref={
              bottomRef
            }
          />
        </div>
      </div>
    </main>

    {/* Composer */}

    <div
      className="
        sticky
        bottom-0
        pt-4
      "
    >
      <div
        className="
          mx-auto
          max-w-5xl
        "
      >
        <ChatComposer
          value={input}
          loading={
            loading
          }
          attachments={
            attachments
          }
          onChange={
            setInput
          }
          onSend={
            sendMessage
          }
          onAttach={(
            files
          ) =>
            setAttachments(
              (
                prev
              ) => [
                ...prev,
                ...files,
              ]
            )
          }
          onRemoveAttachment={(
            index
          ) =>
            setAttachments(
              (
                prev
              ) =>
                prev.filter(
                  (
                    _,
                    i
                  ) =>
                    i !==
                    index
                )
            )
          }
        />
      </div>
    </div>
  </div>
</DashboardLayout>


);
}
