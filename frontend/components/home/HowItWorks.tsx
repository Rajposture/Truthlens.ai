"use client";

import { motion } from "framer-motion";
import { FileInput, SearchCode, BrainCircuit, Stamp } from "lucide-react";

const STEPS = [
  {
    icon: FileInput,
    title: "Submit",
    body: "Paste a claim, a headline, or a full paragraph. TruthLens works from plain text — no formatting required.",
  },
  {
    icon: SearchCode,
    title: "Retrieve",
    body: "A keyword-ranking search pulls the most relevant passages from the knowledge base — the seeded library plus anything you've uploaded.",
  },
  {
    icon: BrainCircuit,
    title: "Reason",
    body: "Groq's model weighs the retrieved evidence and drafts a verdict grounded only in what it actually found — not prior assumptions.",
  },
  {
    icon: Stamp,
    title: "Stamp",
    body: "You get a verdict, a confidence score, and the exact sources behind it — typically in well under two seconds.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="mb-12 max-w-xl">
        <h2 className="font-display text-3xl font-semibold text-paper-100">How verification works</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
          Four steps, end to end, powered by fast keyword retrieval instead of heavyweight
          embedding models — which is a large part of why it&apos;s fast.
        </p>
      </div>

      <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-ink-800 lg:block" />
        {STEPS.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="relative"
          >
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-ink-700 bg-ink-950 text-brass-400">
              <step.icon size={20} />
            </div>
            <p className="mt-4 font-mono text-xs text-text-faint">0{i + 1}</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-paper-100">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
