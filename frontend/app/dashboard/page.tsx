"use client";

import { useEffect, useState } from "react";

import {
  Database,
  FileText,
  ShieldCheck,
  Activity,
  Bot,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import UserSync from "@/components/auth/UserSync";

import { api } from "@/lib/api";

interface DashboardStats {
  documents: number;
}

interface Verification {
  id: number;
  claim: string;
  verdict: string;
}

export default function DashboardPage() {

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [historyCount, setHistoryCount] =
    useState(0);

  const [reportsCount, setReportsCount] =
    useState(0);

  const [recentVerifications, setRecentVerifications] =
    useState<Verification[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {

    try {

      const statsResponse =
        await api.get("/documents/stats");

      setStats(
        statsResponse.data
      );

      try {

        const historyResponse =
          await api.get("/history");

        const history =
          historyResponse.data;

        setHistoryCount(
          history.length
        );

        setRecentVerifications(
          history.slice(0, 5)
        );

      } catch {

        setHistoryCount(0);

      }

      try {

        const reportsResponse =
          await api.get("/reports");

        setReportsCount(
          reportsResponse.data?.length || 0
        );

      } catch {

        setReportsCount(0);

      }

    } catch (error) {

      console.error(error);

    }
  }

  return (
    <>
      <UserSync />

      <DashboardLayout>

        {/* Hero */}

        <div
          className="
            rounded-3xl
            border
            border-zinc-800
            bg-gradient-to-r
            from-zinc-950
            via-zinc-900
            to-zinc-950
            p-8
          "
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h1 className="text-4xl font-bold">
                TruthLens Intelligence Center
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                AI-powered fact verification,
                document intelligence,
                retrieval-augmented reasoning
                and source validation.
              </p>

            </div>

            <div
              className="
                rounded-2xl
                border
                border-cyan-900
                bg-cyan-950/20
                px-6
                py-5
              "
            >
              <p className="text-sm text-zinc-500">
                AI Trust Score
              </p>

              <h2 className="mt-2 text-5xl font-bold text-cyan-400">
                94%
              </h2>
            </div>

          </div>

        </div>

        {/* Stats */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">

            <Database className="h-6 w-6 text-blue-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Indexed Chunks
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {stats?.documents ?? 0}
            </h2>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">

            <ShieldCheck className="h-6 w-6 text-green-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Verifications
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {historyCount}
            </h2>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">

            <FileText className="h-6 w-6 text-purple-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Reports
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {reportsCount}
            </h2>

          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6">

            <Activity className="h-6 w-6 text-yellow-500" />

            <p className="mt-4 text-sm text-zinc-500">
              System Status
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-500">
              Online
            </h2>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="mt-8 grid gap-4 md:grid-cols-3">

          <Link
            href="/verify"
            className="rounded-3xl border border-zinc-800 p-6 hover:border-blue-500"
          >
            <h3 className="font-semibold">
              Verify Claim
            </h3>

            <p className="mt-2 text-zinc-500">
              Fact-check claims using AI.
            </p>

          </Link>

          <Link
            href="/documents"
            className="rounded-3xl border border-zinc-800 p-6 hover:border-green-500"
          >
            <h3 className="font-semibold">
              Documents
            </h3>

            <p className="mt-2 text-zinc-500">
              Manage knowledge sources.
            </p>

          </Link>

          <Link
            href="/reports"
            className="rounded-3xl border border-zinc-800 p-6 hover:border-purple-500"
          >
            <h3 className="font-semibold">
              Reports
            </h3>

            <p className="mt-2 text-zinc-500">
              Review AI findings.
            </p>

          </Link>

        </div>

        {/* Recent Verifications */}

        <div className="mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6">

          <h3 className="text-xl font-semibold">
            Recent Verifications
          </h3>

          <div className="mt-6 space-y-3">

            {recentVerifications.length > 0 ? (

              recentVerifications.map(
                (item) => (

                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 p-4"
                  >
                    <div className="flex justify-between">

                      <p className="max-w-[80%] text-zinc-300">
                        {item.claim}
                      </p>

                      <span>
                        {item.verdict}
                      </span>

                    </div>

                  </div>

                )
              )

            ) : (

              <div className="rounded-xl border border-dashed border-zinc-700 p-4 text-zinc-500">
                No verifications yet.
              </div>

            )}

          </div>

        </div>

        {/* AI Assistant */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-blue-900
            bg-gradient-to-r
            from-blue-950/30
            to-cyan-950/30
            p-8
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <div className="flex items-center gap-3">

                <Bot className="h-6 w-6 text-cyan-400" />

                <h2 className="text-2xl font-bold">
                  TruthLens AI Assistant
                </h2>

              </div>

              <p className="mt-3 text-zinc-400">
                Ask questions about documents,
                reports and claims using RAG +
                Ollama.
              </p>

            </div>

            <Link
              href="/chat"
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-cyan-600
                px-5
                py-3
                font-medium
              "
            >
              Launch
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

        </div>

      </DashboardLayout>
    </>
  );
}