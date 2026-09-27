"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RotateCcw,
  Zap,
  AlertCircle,
  ListChecks,
  Globe,
  Database,
  BrainCircuit,
  ShieldCheck,
  ArrowRight,
  Link2,
} from "lucide-react";
import { Button, Textarea } from "@/components/ui/primitives";
import { ScanState } from "./ScanState";
import { VerdictStamp } from "./VerdictStamp";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { EvidenceList } from "./EvidenceList";
import { MLSignal } from "./MLSignal";
import { verifyClaim, ApiError } from "@/lib/api";
import type { VerdictResult } from "@/lib/types";

const EXAMPLES = [
  "The Earth has only one tectonic plate.",
  "The Ghatkopar landslide occurred on 12 August 2026.",
  "The Sun is located at the center of the Milky Way.",
];

type Status = "idle" | "loading" | "error" | "done";

export function VerifyPanel() {
  const [claim, setClaim] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<VerdictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runVerification(text: string) {
    const trimmed = text.trim();
    if (!trimmed || status === "loading") return;
    setStatus("loading");
    setError(null);
    try {
      const data = await verifyClaim(trimmed);
      setResult(data);
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function reset() {
    setClaim("");
    setResult(null);
    setStatus("idle");
    setError(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="desk-surface rounded-[var(--radius-lg)] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-brass-300">
                Verification desk
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-paper-100">
                What should we check?
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">
                Paste a claim, headline, or a paragraph. TruthLens retrieves evidence first,
                asks the language model to reason over that evidence, and shows a separate trained
                ML signal underneath.
              </p>
            </div>
            <div className="hidden shrink-0 rounded-full border border-ink-700 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-faint sm:block">
              Evidence first
            </div>
          </div>

          <div className="mt-6">
            <Textarea
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runVerification(claim);
              }}
              maxLength={2000}
              rows={8}
              placeholder="Example: The Ghatkopar landslide occurred on 12 August 2026."
              disabled={status === "loading"}
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-text-faint">
              <span>Ctrl/Cmd + Enter to verify</span>
              <span>{claim.length}/2000</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                onClick={() => setClaim(example)}
                disabled={status === "loading"}
                className="rounded-full border border-ink-700 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-brass-400/50 hover:text-brass-300 disabled:opacity-40"
              >
                {example}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/50 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-text-primary">
              <Link2 size={14} className="text-brass-400" />
              News / article input
            </div>
            <p className="mt-1 text-xs leading-relaxed text-text-faint">
              For a full article, paste its factual claims here or add the article/PDF in the
              Knowledge Base. Current live-news verification is evidence-driven when web search is configured.
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => runVerification(claim)}
              disabled={!claim.trim() || status === "loading"}
            >
              <Search size={17} />
              {status === "loading" ? "Verifying..." : "Verify claim"}
            </Button>
            {status !== "idle" && (
              <Button size="lg" variant="secondary" onClick={reset}>
                <RotateCcw size={16} />
              </Button>
            )}
          </div>
        </div>

        <div className="desk-surface min-h-[420px] rounded-[var(--radius-lg)] p-6 sm:p-7">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[400px] flex-col items-center justify-center text-center"
              >
                <div className="grid grid-cols-3 gap-2">
                  <PipelineNode icon={Database} label="Retrieve" />
                  <PipelineArrow />
                  <PipelineNode icon={BrainCircuit} label="Reason" />
                  <PipelineArrow className="col-start-2" />
                  <PipelineNode icon={ShieldCheck} label="Cross-check" />
                </div>
                <p className="mt-7 max-w-sm text-sm leading-relaxed text-text-faint">
                  The result panel will show the evidence, the evidence-grounded verdict, and the
                  independent ML prediction.
                </p>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ScanState />
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-center"
              >
                <AlertCircle size={28} className="text-false-400" />
                <p className="max-w-sm text-sm text-text-muted">{error}</p>
                <Button variant="secondary" size="sm" onClick={() => runVerification(claim)}>
                  Try again
                </Button>
              </motion.div>
            )}

            {status === "done" && result && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center gap-5 border-b border-ink-800 pb-6 sm:flex-row sm:justify-center sm:gap-8">
                  <VerdictStamp verdict={result.verdict} />
                  <div>
                    <ConfidenceGauge confidence={result.confidence} verdict={result.verdict} />
                    <div className="mt-2 text-center">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-text-faint">
                        Evidence-grounded confidence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-faint">
                  <span className="flex items-center gap-2">
                    <Zap size={13} className="text-brass-400" />
                    {result.latency_ms}ms
                  </span>
                  <span className="flex items-center gap-2">
                    <Database size={13} className="text-brass-400" />
                    {result.evidence.length} evidence item{result.evidence.length === 1 ? "" : "s"}
                  </span>
                  {result.used_web_search && (
                    <span className="flex items-center gap-1.5 text-verified-400">
                      <Globe size={13} />
                      Live web evidence used
                    </span>
                  )}
                </div>

                <div className="mt-4 rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/40 p-4">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-text-faint">Reasoning</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-text-primary">{result.reasoning}</p>
                </div>

                {result.key_points.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {result.key_points.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-text-muted">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6">
                  <p className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-text-faint">
                    Evidence trace
                  </p>
                  <EvidenceList evidence={result.evidence} />
                </div>

                {result.ml_prediction && (
                  <div className="mt-6">
                    <p className="mb-3 font-display text-xs font-semibold uppercase tracking-wider text-text-faint">
                      Independent ML signal
                    </p>
                    <MLSignal prediction={result.ml_prediction} />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function PipelineNode({
  icon: Icon,
  label,
}: {
  icon: typeof Database;
  label: string;
}) {
  return (
    <div className="flex min-w-28 flex-col items-center gap-2 rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/50 px-4 py-4">
      <Icon size={18} className="text-brass-400" />
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

function PipelineArrow({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center text-ink-600 ${className}`}>
      <ArrowRight size={16} />
    </div>
  );
}
