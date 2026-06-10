"use client";

import {
  Plus,
  MessageSquare,
  Database,
  Settings
} from "lucide-react";

interface Props {
  onNewChat: () => void;
}

export default function ChatSidebar({
  onNewChat,
}: Props) {
  return (
    <aside
      className="
        hidden
        lg:flex
        w-[290px]
        flex-col
        border-r
        border-zinc-900
        bg-black/50
        backdrop-blur-xl
      "
    >
      <div className="p-5">

        <button
          onClick={onNewChat}
          className="
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            border
            border-zinc-800
            px-4
            py-3
            transition
            hover:bg-zinc-900
          "
        >
          <Plus size={18} />
          New Chat
        </button>

      </div>

      <div className="flex-1 px-3">

        <div className="mb-8">

          <div
            className="
              mb-3
              px-3
              text-xs
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Recent Chats
          </div>

          {[
            "Fraud Analysis",
            "Research Docs",
            "Company Reports",
          ].map((item) => (
            <button
              key={item}
              className="
                mb-1
                flex
                w-full
                items-center
                gap-3
                rounded-xl
                px-3
                py-3
                text-left
                hover:bg-zinc-900
              "
            >
              <MessageSquare size={16} />
              <span>{item}</span>
            </button>
          ))}
        </div>

        <div>

          <div
            className="
              mb-3
              px-3
              text-xs
              uppercase
              tracking-wider
              text-zinc-500
            "
          >
            Workspace
          </div>

          <button
            className="
              mb-1
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              hover:bg-zinc-900
            "
          >
            <Database size={16} />
            Knowledge Base
          </button>

          <button
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              hover:bg-zinc-900
            "
          >
            <Settings size={16} />
            Settings
          </button>

        </div>

      </div>
    </aside>
  );
}