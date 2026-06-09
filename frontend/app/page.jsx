import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Database,
  Brain,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}

      <nav
        className="
          flex
          items-center
          justify-between
          px-8
          py-6
          border-b
          border-zinc-900
        "
      >
        <h1 className="text-2xl font-bold">
          TruthLens AI
        </h1>

        <Link
          href="/auth"
          className="
            rounded-xl
            border
            border-zinc-700
            px-5
            py-2
            hover:bg-zinc-900
            transition
          "
        >
          Sign In
        </Link>
      </nav>

      {/* Hero */}

      <section
        className="
          mx-auto
          max-w-7xl
          px-8
          py-32
          text-center
        "
      >
        <div
          className="
            inline-block
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
          AI-Powered Fact Verification
        </div>

        <h1
          className="
            mt-8
            text-6xl
            font-bold
            leading-tight
          "
        >
          Verify Claims,
          <br />
          Reports &
          <span className="text-blue-500">
            {" "}News Instantly
          </span>
        </h1>

        <p
          className="
            mx-auto
            mt-8
            max-w-3xl
            text-xl
            text-zinc-400
          "
        >
          TruthLens combines RAG,
          ChromaDB, Neon PostgreSQL,
          Clerk Authentication and Local LLMs
          to detect misinformation and
          validate information with evidence.
        </p>

        <div
          className="
            mt-12
            flex
            justify-center
            gap-4
          "
        >
          <Link
            href="/auth"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-8
              py-4
              font-semibold
              hover:bg-blue-500
              transition
            "
          >
            Get Started
            <ArrowRight size={18} />
          </Link>

          <Link
            href="/dashboard"
            className="
              rounded-xl
              border
              border-zinc-700
              px-8
              py-4
              hover:bg-zinc-900
              transition
            "
          >
            Dashboard
          </Link>
        </div>
      </section>

      {/* Features */}

      <section
        className="
          mx-auto
          grid
          max-w-7xl
          gap-8
          px-8
          pb-24
          md:grid-cols-3
        "
      >
        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-8
          "
        >
          <ShieldCheck
            className="
              h-10
              w-10
              text-blue-500
            "
          />

          <h3 className="mt-6 text-2xl font-semibold">
            Fact Verification
          </h3>

          <p className="mt-3 text-zinc-400">
            Analyze claims using AI-powered
            reasoning and evidence retrieval.
          </p>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-8
          "
        >
          <Database
            className="
              h-10
              w-10
              text-green-500
            "
          />

          <h3 className="mt-6 text-2xl font-semibold">
            Vector Knowledge Base
          </h3>

          <p className="mt-3 text-zinc-400">
            Search across indexed PDFs,
            reports and research documents.
          </p>
        </div>

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-8
          "
        >
          <Brain
            className="
              h-10
              w-10
              text-purple-500
            "
          />

          <h3 className="mt-6 text-2xl font-semibold">
            Local AI Models
          </h3>

          <p className="mt-3 text-zinc-400">
            Powered by Ollama and RAG
            pipelines for privacy-first
            verification.
          </p>
        </div>
      </section>

    </main>
  );
}