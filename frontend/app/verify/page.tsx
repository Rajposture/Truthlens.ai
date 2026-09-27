import type { Metadata } from "next";
import { VerifyPanel } from "@/components/verify/VerifyPanel";

export const metadata: Metadata = {
  title: "Verify a claim - TruthLens AI",
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-ink-700 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
            Evidence-first claim intelligence
          </span>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-paper-100 sm:text-6xl">
            Verify the claim. Trace the evidence. See the model&apos;s reasoning.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-text-muted">
            TruthLens combines BM25 retrieval, live evidence when configured, Groq reasoning, and a
            separately trained classifier. The final verdict is grounded in retrieved evidence; the
            ML model remains an independent signal.
          </p>
        </div>

        <div className="grid gap-2 text-xs text-text-faint sm:grid-cols-3 lg:grid-cols-1">
          {[
            ["01", "Retrieve", "Find relevant evidence"],
            ["02", "Reason", "Compare the claim with evidence"],
            ["03", "Learn", "Adapt only from high-confidence verified cases"],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/40 p-3">
              <span className="font-mono text-brass-300">{n}</span>
              <p className="mt-1 text-sm text-text-primary">{t}</p>
              <p className="mt-0.5">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10">
        <VerifyPanel />
      </div>
    </main>
  );
}
