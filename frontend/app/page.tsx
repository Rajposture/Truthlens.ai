import type { Metadata } from "next";
import { VerifyPanel } from "@/components/verify/VerifyPanel";

export const metadata: Metadata = {
  title: "Verify a claim — TruthLens AI",
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-paper-100 sm:text-4xl">
          Bring a claim into focus
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
          Drop in a statement and TruthLens will retrieve matching evidence from its knowledge
          base and reason over it with AI to produce a grounded verdict.
        </p>
      </div>
      <VerifyPanel />
    </div>
  );
}
