import { FileText } from "lucide-react";
import type { Evidence } from "@/lib/types";

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
  if (evidence.length === 0) {
    return (
      <p className="rounded-[var(--radius-md)] border border-dashed border-ink-700 px-4 py-5 text-sm text-text-faint">
        No matching evidence was found in the knowledge base for this claim. The verdict above
        relies on general reasoning alone — treat it with extra caution, or add a source document
        on the Knowledge Base page and try again.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {evidence.map((item, i) => (
        <li
          key={i}
          className="rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/40 py-3 pl-4 pr-4 border-l-2 border-l-brass-400/50"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 truncate font-mono text-xs text-brass-300">
              <FileText size={13} className="shrink-0" />
              <span className="truncate">{item.source}</span>
            </span>
            <span className="shrink-0 font-mono text-xs text-text-faint">
              {item.relevance.toFixed(0)}% match
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{item.snippet}</p>
        </li>
      ))}
    </ul>
  );
}
