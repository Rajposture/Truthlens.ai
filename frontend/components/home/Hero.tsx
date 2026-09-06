"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { LiveDemo } from "./LiveDemo";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-800">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-3 py-1 font-mono text-[11px] text-text-muted">
            Verification &amp; chat powered by Groq
          </span>

          <h1 className="text-balance mt-5 font-display text-4xl font-bold leading-[1.08] text-paper-100 sm:text-5xl lg:text-[3.4rem]">
            Bring every claim into focus.
          </h1>

          <p className="mt-5 max-w-lg text-[17px] leading-relaxed text-text-muted">
            TruthLens checks statements against a real knowledge base and reasons over the
            evidence with AI — returning a verdict, a confidence score, and the sources behind it,
            usually in under two seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-brass-400 bg-brass-400 px-5 py-3 text-sm font-medium text-ink-950 transition-shadow hover:shadow-[0_0_28px_-4px_rgba(201,162,75,0.55)]"
            >
              Verify a claim
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-ink-700 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-brass-400/50 hover:text-brass-300"
            >
              <MessageSquareText size={16} />
              Chat with the assistant
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
        >
          <LiveDemo />
        </motion.div>
      </div>
    </section>
  );
}
