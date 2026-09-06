"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ApertureMark } from "@/components/brand/ApertureMark";

const PHASES = [
  "Reading the claim...",
  "Searching the knowledge base...",
  "Weighing the evidence...",
  "Reasoning it through...",
];

export function ScanState() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % PHASES.length), 1300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="relative flex h-28 w-28 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-brass-400/50 animate-pulse-ring" />
        <span
          className="absolute inset-0 rounded-full border border-brass-400/50 animate-pulse-ring"
          style={{ animationDelay: "0.7s" }}
        />
        <ApertureMark size={64} animate ringed={false} />
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="font-mono text-sm text-text-muted"
        >
          {PHASES[phase]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
