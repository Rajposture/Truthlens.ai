"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScanState } from "@/components/verify/ScanState";
import { VerdictStamp } from "@/components/verify/VerdictStamp";
import type { Verdict } from "@/lib/types";

const EXAMPLES: { claim: string; verdict: Verdict; confidence: number }[] = [
  { claim: "The Great Wall of China is visible from space with the naked eye.", verdict: "False", confidence: 93 },
  { claim: "Water boils at 100°C (212°F) at sea level.", verdict: "True", confidence: 98 },
  { claim: "Napoleon was unusually short for his era.", verdict: "Misleading", confidence: 80 },
];

const PHASE_DURATIONS = { claim: 1100, scanning: 1500, result: 3200 };

export function LiveDemo() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"claim" | "scanning" | "result">("claim");

  useEffect(() => {
    const duration = PHASE_DURATIONS[phase];
    const id = setTimeout(() => {
      if (phase === "claim") setPhase("scanning");
      else if (phase === "scanning") setPhase("result");
      else {
        setPhase("claim");
        setIndex((i) => (i + 1) % EXAMPLES.length);
      }
    }, duration);
    return () => clearTimeout(id);
  }, [phase]);

  const current = EXAMPLES[index];

  return (
    <div className="desk-surface grain-overlay relative overflow-hidden rounded-[var(--radius-xl)] p-6 sm:p-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-faint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-verified-400" />
          Live demo
        </span>
        <span className="font-mono text-[11px] text-text-faint">Example claim</span>
      </div>

      <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {phase === "claim" && (
            <motion.p
              key={`claim-${index}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="text-balance font-display text-xl font-medium text-paper-100 sm:text-2xl"
            >
              &ldquo;{current.claim}&rdquo;
            </motion.p>
          )}

          {phase === "scanning" && (
            <motion.div key={`scan-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScanState />
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key={`result-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <VerdictStamp verdict={current.verdict} size="sm" />
              <p className="max-w-xs text-sm text-text-muted">&ldquo;{current.claim}&rdquo;</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
