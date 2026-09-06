import Link from "next/link";
import { ApertureMark } from "@/components/brand/ApertureMark";

export function Footer() {
  return (
    <footer className="border-t border-ink-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <ApertureMark size={22} />
            <span className="font-display text-[15px] font-semibold text-paper-100">TruthLens AI</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Evidence-grounded verification and a retrieval-augmented assistant, answering from
            Groq&apos;s LPUs so the wait never gets in the way of the answer.
          </p>
        </div>

        <div className="flex gap-12">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-wider text-text-faint">
              Tools
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li><Link href="/verify" className="hover:text-brass-300">Verify a claim</Link></li>
              <li><Link href="/chat" className="hover:text-brass-300">AI assistant</Link></li>
              <li><Link href="/knowledge" className="hover:text-brass-300">Knowledge base</Link></li>
              <li><Link href="/history" className="hover:text-brass-300">History</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-ink-800 px-6 py-5 sm:px-8">
        <p className="mx-auto max-w-7xl text-xs leading-relaxed text-text-faint">
          TruthLens is a research and reference tool. Verdicts reflect the evidence available in
          its knowledge base and an AI model&apos;s reasoning over it — they are not legal,
          medical, or professional advice, and can be wrong. Always check high-stakes claims
          against a primary source.
        </p>
      </div>
    </footer>
  );
}
