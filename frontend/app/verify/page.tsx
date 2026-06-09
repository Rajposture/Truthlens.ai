import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VerifyBox from "@/components/verification/VerifyBox";

export default function VerifyPage() {
  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* Hero */}

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-zinc-800
            bg-gradient-to-br
            from-zinc-950
            via-zinc-900
            to-black
            p-10
          "
        >

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_35%)]" />

          <div className="relative">

            <div
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-blue-500/20
                bg-blue-500/10
                px-4
                py-2
                text-sm
                text-blue-400
              "
            >
              AI Verification Workspace
            </div>

            <h1 className="mt-6 text-5xl font-bold tracking-tight">

              Verify News,
              <span className="text-blue-500">
                {" "}Claims & Reports
              </span>

            </h1>

            <p className="mt-5 max-w-3xl text-lg text-zinc-400">

              Analyze articles, uploaded PDFs,
              research papers and online claims
              using Retrieval-Augmented Generation,
              ChromaDB and local LLM reasoning.

            </p>

          </div>

        </div>

        {/* Stats */}

        <div className="grid gap-6 md:grid-cols-3">

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
            "
          >
            <p className="text-zinc-500">
              Verification Engine
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              Ollama AI
            </h3>

            <p className="mt-3 text-sm text-zinc-500">
              Local LLM powered reasoning
            </p>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
            "
          >
            <p className="text-zinc-500">
              Knowledge Base
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              ChromaDB
            </h3>

            <p className="mt-3 text-sm text-zinc-500">
              Vector-powered evidence retrieval
            </p>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
            "
          >
            <p className="text-zinc-500">
              AI Pipeline
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              RAG
            </h3>

            <p className="mt-3 text-sm text-zinc-500">
              Retrieval + reasoning workflow
            </p>
          </div>

        </div>

        {/* Verification Workspace */}

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >

          <div className="mb-6">

            <h2 className="text-2xl font-bold">
              Verification Workspace
            </h2>

            <p className="mt-2 text-zinc-500">
              Paste a claim, upload a document,
              or analyze news content.
            </p>

          </div>

          <VerifyBox />

        </div>

      </div>

    </DashboardLayout>
  );
}