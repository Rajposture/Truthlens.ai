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
useState<Message[]>([]);

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
        data.response,
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

setMessages([]);

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

setMessages([]);


}

return (


<DashboardLayout>

  <VideoBackground />

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

    <div
      className="
        flex
        items-center
        justify-end
        gap-3
        mb-6
      "
    >

      <button
        onClick={
          createNewChat
        }
        className="
          rounded-2xl
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
          rounded-2xl
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

    <main
      className="
        flex-1
        overflow-y-auto
      "
    >

      {messages.length === 0 ? (

        <div
          className="
            flex
            h-full
            flex-col
            items-center
            justify-center
            text-center
          "
        >

          <h1
            className="
              text-5xl
              font-bold
              text-white
            "
          >
            TruthLens AI
          </h1>

          <p
            className="
              mt-4
              max-w-xl
              text-white/60
            "
          >
            Research, verify claims,
            analyze documents and
            chat with your knowledge base.
          </p>

        </div>

      ) : (

        <div
          className="
            mx-auto
            max-w-5xl
            pb-12
          "
        >

          <div className="space-y-10">

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

              <div
                className="
                  text-white/60
                  animate-pulse
                "
              >
                Thinking...
              </div>

            )}

            <div
              ref={bottomRef}
            />

          </div>

        </div>

      )}

    </main>

    <div
      className="
        sticky
        bottom-0
        pt-6
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
          loading={loading}
          attachments={attachments}
          onChange={setInput}
          onSend={sendMessage}
          onAttach={(files) =>
            setAttachments(
              (prev) => [
                ...prev,
                ...files,
              ]
            )
          }
          onRemoveAttachment={(index) =>
            setAttachments(
              (prev) =>
                prev.filter(
                  (_, i) =>
                    i !== index
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
