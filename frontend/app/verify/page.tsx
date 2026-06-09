import VerifyBox from "@/components/verification/VerifyBox";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero Section */}
      <section className="relative">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6">

          <div className="mb-6 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400 backdrop-blur">
            AI-Powered Fact Verification Platform
          </div>

          <h1 className="max-w-5xl text-center text-6xl font-bold tracking-tight md:text-7xl">
            Verify News,
            <span className="text-blue-500">
              {" "}Claims & Reports
            </span>
            <br />
            With AI
          </h1>

          <p className="mt-6 max-w-3xl text-center text-lg text-zinc-400">
            Upload reports, research papers, PDFs and articles.
            TruthLens uses Retrieval-Augmented Generation (RAG),
            vector search and local AI models to validate information
            with supporting evidence.
          </p>

          <div className="mt-12 w-full">
            <VerifyBox />
          </div>

          {/* Stats */}
          <div className="mt-16 grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-zinc-500">
                Verification Engine
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                Local AI
              </h3>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-zinc-500">
                Knowledge Base
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                ChromaDB
              </h3>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-zinc-500">
                Retrieval Pipeline
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                RAG Powered
              </h3>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}