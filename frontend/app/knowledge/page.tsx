import type { Metadata } from "next";
import { KnowledgePanel } from "@/components/knowledge/KnowledgePanel";

export const metadata: Metadata = {
  title: "Knowledge Base — TruthLens AI",
};

export default function KnowledgePage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-semibold text-paper-100 sm:text-4xl">Knowledge base</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
          Upload documents to give TruthLens more to work with. Every file is chunked and indexed
          immediately, and both Verify and the AI Assistant will start pulling from it right away.
        </p>
      </div>
      <KnowledgePanel />
    </div>
  );
}
