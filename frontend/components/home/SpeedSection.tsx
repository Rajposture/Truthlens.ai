"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Radio, Rss } from "lucide-react";
import { getHealth } from "@/lib/api";

type PingState = { status: "checking" | "online" | "offline"; ms: number | null };

const POINTS = [
  {
    icon: Gauge,
    title: "LPU inference",
    body: "Groq runs open models on purpose-built hardware, not general GPUs — responses stream back noticeably faster than most hosted APIs.",
  },
  {
    icon: Rss,
    title: "No embedding models",
    body: "Retrieval runs on BM25, a keyword-ranking algorithm with no model weights to load — indexing and search both happen in milliseconds.",
  },
  {
    icon: Radio,
    title: "Streamed answers",
    body: "The AI Assistant streams tokens as they're generated, so you're reading the first words while the rest is still being written.",
  },
];

export function SpeedSection() {
  const [ping, setPing] = useState<PingState>({ status: "checking", ms: null });

  useEffect(() => {
    let cancelled = false;
    const started = performance.now();
    getHealth()
      .then(() => {
        if (!cancelled) setPing({ status: "online", ms: Math.round(performance.now() - started) });
      })
      .catch(() => {
        if (!cancelled) setPing({ status: "offline", ms: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="border-t border-ink-800">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <h2 className="font-display text-3xl font-semibold text-paper-100">Built for speed, honestly</h2>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-text-muted">
            Most of the wait in a typical RAG app comes from loading embedding models and calling
            a slow, general-purpose LLM API. TruthLens avoids both.
          </p>

          <div className="mt-8 space-y-6">
            {POINTS.map((point, i) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-4"
              >
                <point.icon size={20} className="mt-0.5 shrink-0 text-brass-400" />
                <div>
                  <h3 className="font-display text-[15px] font-semibold text-paper-100">{point.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{point.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="desk-surface rounded-[var(--radius-lg)] p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-text-faint">Live status</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              {ping.status === "online" && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verified-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                  ping.status === "online"
                    ? "bg-verified-400"
                    : ping.status === "offline"
                      ? "bg-false-400"
                      : "bg-unverified-400"
                }`}
              />
            </span>
            <span className="text-sm text-text-primary">
              {ping.status === "checking" && "Checking backend..."}
              {ping.status === "online" && "Backend online"}
              {ping.status === "offline" && "Backend unreachable"}
            </span>
          </div>
          <p className="mt-3 font-mono text-2xl font-semibold text-paper-100">
            {ping.status === "online" ? `${ping.ms}ms` : "—"}
          </p>
          <p className="mt-1 text-xs text-text-faint">
            {ping.status === "offline"
              ? "Set NEXT_PUBLIC_API_URL and make sure the backend is running."
              : "Round-trip time for this page's health check, right now."}
          </p>
        </div>
      </div>
    </section>
  );
}
