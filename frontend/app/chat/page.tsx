import type { Metadata } from "next";
import { ChatPanel } from "@/components/chat/ChatPanel";

export const metadata: Metadata = {
  title: "AI Assistant — TruthLens AI",
};

export default function ChatPage() {
  return <ChatPanel />;
}
