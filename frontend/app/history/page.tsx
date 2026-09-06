import type { Metadata } from "next";
import { HistoryPanel } from "@/components/history/HistoryPanel";

export const metadata: Metadata = {
  title: "History — TruthLens AI",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-paper-100 sm:text-4xl">Verification history</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
          Every claim you&apos;ve verified, with its verdict, reasoning, and evidence — stored locally
          on the backend, not tied to an account.
        </p>
      </div>
      <HistoryPanel />
    </div>
  );
}
