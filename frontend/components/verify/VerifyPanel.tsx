"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw, Zap, AlertCircle, ListChecks } from "lucide-react";
import { Button, Textarea } from "@/components/ui/primitives";
import { ScanState } from "./ScanState";
import { VerdictStamp } from "./VerdictStamp";
import { ConfidenceGauge } from "./ConfidenceGauge";
import { EvidenceList } from "./EvidenceList";
import { verifyClaim, ApiError } from "@/lib/api";
import type { VerdictResult } from "@/lib/types";

const EXAMPLES = [
  "The Eiffel Tower is located in Berlin.",
  "Honey never spoils if stored properly.",
  "Goldfish have a three-second memory.",
  "Napoleon was unusually short for his era.",
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
      {/* Intake panel */}
      <div className="desk-surface rounded-[var(--radius-lg)] p-6 sm:p-7">
        <h2 className="font-display text-lg font-semibold text-paper-100">Submit a claim</h2>
        <p className="mt-1.5 text-sm text-text-muted">
          Paste a claim, headline, or statement. TruthLens checks it against its knowledge base
          and reasons over the evidence with AI.
        </p>

        <div className="mt-5">
          <Textarea
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runVerification(claim);
            }}
            maxLength={2000}
            rows={6}
            placeholder="e.g. The Great Wall of China is visible from space with the naked eye."
            disabled={status === "loading"}
          />
          <div className="mt-1.5 flex items-center justify-between text-xs text-text-faint">
            <span>Ctrl/Cmd + Enter to scan</span>
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

        <div className="mt-6 flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => runVerification(claim)}
            disabled={!claim.trim() || status === "loading"}
          >
            <Search size={17} />
            Scan claim
          </Button>
          {status === "done" && (
            <Button size="lg" variant="secondary" onClick={reset}>
              <RotateCcw size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Results panel */}
      <div className="desk-surface min-h-[420px] rounded-[var(--radius-lg)] p-6 sm:p-7">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[370px] flex-col items-center justify-center gap-3 text-center"
            >
              <ListChecks size={30} className="text-ink-600" />
              <p className="max-w-xs text-sm text-text-faint">
                Your verdict, confidence score, and supporting evidence will appear here.
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
              className="flex h-full min-h-[370px] flex-col items-center justify-center gap-3 text-center"
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
                <ConfidenceGauge confidence={result.confidence} verdict={result.verdict} />
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-text-faint">
                <Zap size={13} className="text-brass-400" />
                Answered in {result.latency_ms}ms
              </div>

              <p className="mt-3 text-[15px] leading-relaxed text-text-primary">{result.reasoning}</p>

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
                  Evidence considered
                </p>
                <EvidenceList evidence={result.evidence} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
