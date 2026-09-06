"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";

const VERDICTS = [
  {
    icon: CheckCircle2,
    name: "True",
    tone: "verified" as const,
    body: "The evidence directly supports the claim as stated, without material caveats.",
  },
  {
    icon: XCircle,
    name: "False",
    tone: "false" as const,
    body: "The evidence directly contradicts the claim — including well-documented myths and mix-ups.",
  },
  {
    icon: AlertTriangle,
    name: "Misleading",
    tone: "misleading" as const,
    body: "The claim contains some truth but omits context, uses a contested framing, or overstates what the evidence shows.",
  },
  {
    icon: HelpCircle,
    name: "Unverified",
    tone: "unverified" as const,
    body: "The knowledge base doesn't yet contain evidence that clearly settles it either way — so TruthLens says so, instead of guessing.",
  },
];

const TONE_CLASSES = {
  verified: { icon: "text-verified-400", ring: "group-hover:border-verified-500/50" },
  false: { icon: "text-false-400", ring: "group-hover:border-false-500/50" },
  misleading: { icon: "text-misleading-400", ring: "group-hover:border-misleading-500/50" },
  unverified: { icon: "text-unverified-400", ring: "group-hover:border-unverified-500/50" },
};

export function VerdictGuide() {
  return (
    <section className="border-t border-ink-800">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-12 max-w-xl">
          <h2 className="font-display text-3xl font-semibold text-paper-100">Four verdicts, no hedging</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
            Every claim resolves to exactly one of these — each with its own color, so you can
            scan a page of results at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VERDICTS.map((v, i) => (
            <motion.div
              key={v.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`group desk-surface rounded-[var(--radius-lg)] p-5 transition-colors ${TONE_CLASSES[v.tone].ring}`}
            >
              <v.icon size={22} className={TONE_CLASSES[v.tone].icon} />
              <h3 className="mt-3 font-display text-base font-semibold text-paper-100">{v.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{v.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
