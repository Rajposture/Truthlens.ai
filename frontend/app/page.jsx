import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

import {
  ArrowRight,
  ShieldCheck,
  Database,
  Brain,
  Activity,
  FileSearch,
  Lock,
} from "lucide-react";

export default async function HomePage() {
  const { userId } = await auth();

  const features = [
    {
      icon: ShieldCheck,
      title: "Fact Verification",
      description:
        "Validate claims using retrieval-augmented reasoning and evidence-backed analysis.",
    },
    {
      icon: Database,
      title: "Document Intelligence",
      description:
        "Search across PDFs, reports, research papers and private knowledge bases.",
    },
    {
      icon: Brain,
      title: "Local AI Models",
      description:
        "Powered by Ollama and ChromaDB for privacy-focused reasoning.",
    },
    {
      icon: FileSearch,
      title: "Evidence Retrieval",
      description:
        "Retrieve supporting evidence and source references automatically.",
    },
    {
      icon: Lock,
      title: "Private by Design",
      description:
        "Run locally and keep sensitive documents inside your infrastructure.",
    },
    {
      icon: Activity,
      title: "AI Monitoring",
      description:
        "Track verification history, reports and system activity.",
    },
  ];

  return (
    <main className="truthlens-shell min-h-screen text-white">

      {/* Background Effects */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div
          className="
            absolute
            left-1/2
            top-0
            h-[700px]
            w-[700px]
            -translate-x-1/2
            rounded-full
            bg-white/[0.03]
            blur-[180px]
          "
        />

        <div
          className="
            absolute
            bottom-0
            right-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-white/[0.02]
            blur-[180px]
          "
        />

      </div>

      <div className="relative mx-auto max-w-7xl px-6">

        {/* NAVBAR */}

        <header
          className="
            sticky
            top-6
            z-50
            mt-6
            flex
            items-center
            justify-between
            rounded-3xl
            border
            border-white/10
            bg-black/40
            px-6
            py-4
            backdrop-blur-xl
          "
        >

          <Link
            href="/"
            className="flex items-center gap-4"
          >
            <Image
              src="/logo.png"
              alt="TruthLens"
              width={42}
              height={42}
            />

            <span
              className="
                text-2xl
                font-bold
                tracking-wide
              "
            >
              TruthLens
            </span>
          </Link>

          <div className="flex items-center gap-3">

            {userId ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="
                      border-white/10
                      bg-white/5
                      backdrop-blur
                    "
                  >
                    Dashboard
                  </Button>
                </Link>

                <UserButton />
              </>
            ) : (
              <>
                <Link href="/auth/sign-in">
                  <Button
                    variant="outline"
                    className="
                      border-white/10
                      bg-white/5
                    "
                  >
                    Sign In
                  </Button>
                </Link>

                <Link href="/auth/sign-up">
                  <Button>
                    Get Started
                  </Button>
                </Link>
              </>
            )}

          </div>

        </header>

        {/* HERO */}

        <section className="py-28">

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/10
              bg-white/5
              px-4
              py-2
              text-sm
              text-zinc-400
            "
          >
            <Activity className="h-4 w-4" />
            AI Fact Verification Platform
          </div>

          <h1
            className="
              mt-8
              max-w-5xl
              text-6xl
              font-bold
              leading-[0.95]
              tracking-tight
              md:text-7xl
              xl:text-8xl
            "
          >
            Verify Claims,
            <br />
            <span className="text-zinc-500">
              Reports & News
            </span>
          </h1>

          <p
            className="
              mt-8
              max-w-2xl
              text-lg
              leading-relaxed
              text-zinc-400
            "
          >
            TruthLens combines Retrieval-Augmented Generation,
            ChromaDB and local AI models to validate information
            using evidence-based reasoning.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">

            <Link
              href={
                userId
                  ? "/dashboard"
                  : "/auth/sign-up"
              }
            >
              <Button
                size="lg"
                className="gap-2"
              >
                Start Verifying
                <ArrowRight size={16} />
              </Button>
            </Link>

            <Link href="/verify">
              <Button
                size="lg"
                variant="outline"
                className="
                  border-white/10
                  bg-white/5
                "
              >
                Try a Claim
              </Button>
            </Link>

          </div>

        </section>

        {/* FEATURES */}

        <section
          className="
            grid
            gap-6
            pb-20
            md:grid-cols-2
            xl:grid-cols-3
          "
        >

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="
                  group
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  p-7
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-white/20
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3
                  className="
                    mt-5
                    text-lg
                    font-semibold
                  "
                >
                  {feature.title}
                </h3>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-7
                    text-zinc-400
                  "
                >
                  {feature.description}
                </p>

              </div>
            );
          })}

        </section>

      </div>

    </main>
  );
}