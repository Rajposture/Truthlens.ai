import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpen } from "lucide-react";
import { ApertureMark } from "@/components/brand/ApertureMark";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink-700 bg-ink-900">
          <ApertureMark size={18} ringed={false} />
        </div>
      )}
      <div className={cn("max-w-[80%] sm:max-w-[70%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-[var(--radius-md)] px-4 py-3 text-[15px] leading-relaxed",
            isUser ? "bg-brass-400 text-ink-950" : "desk-surface text-text-primary"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content || "..."}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {message.sources.map((source) => (
              <span
                key={source}
                className="inline-flex items-center gap-1 rounded-full border border-ink-700 px-2.5 py-1 font-mono text-[11px] text-text-faint"
              >
                <BookOpen size={11} />
                {source}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
