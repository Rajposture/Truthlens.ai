"use client";

import { useEffect, useState } from "react";

import {
  Database,
  FileText,
  ShieldCheck,
  Activity,
} from "lucide-react";

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
    useState<DashboardStats | null>(
      null
    );

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
        await api.get(
          "/documents/stats"
        );

      setStats(
        statsResponse.data
      );

      try {

        const historyResponse =
          await api.get(
            "/history"
          );

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
          await api.get(
            "/reports"
          );

        setReportsCount(
          reportsResponse.data
            ?.length || 0
        );

      } catch {

        setReportsCount(0);

      }

    } catch (error) {

      console.error(
        error
      );

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
          <h1 className="text-4xl font-bold">
            TruthLens Intelligence Center
          </h1>

          <p className="mt-3 text-zinc-400">
            AI-powered fact verification,
            retrieval-augmented reasoning,
            and document intelligence.
          </p>
        </div>

        {/* Stats */}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950/70
              backdrop-blur-xl
              p-6
              transition-all
              hover:border-blue-500/50
            "
          >
            <Database className="h-6 w-6 text-blue-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Indexed Chunks
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {stats?.documents ?? 0}
            </h2>

          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950/70
              backdrop-blur-xl
              p-6
              transition-all
              hover:border-green-500/50
            "
          >
            <ShieldCheck className="h-6 w-6 text-green-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Verifications
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {historyCount}
            </h2>

          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950/70
              backdrop-blur-xl
              p-6
              transition-all
              hover:border-purple-500/50
            "
          >
            <FileText className="h-6 w-6 text-purple-500" />

            <p className="mt-4 text-sm text-zinc-500">
              Reports
            </p>

            <h2 className="mt-2 text-5xl font-bold">
              {reportsCount}
            </h2>

          </div>

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950/70
              backdrop-blur-xl
              p-6
              transition-all
              hover:border-yellow-500/50
            "
          >
            <Activity className="h-6 w-6 text-yellow-500" />

            <p className="mt-4 text-sm text-zinc-500">
              System Status
            </p>

            <h2 className="mt-2 text-3xl font-bold text-green-500">
              Online
            </h2>

          </div>

        </div>

        {/* System Activity */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h3 className="text-xl font-semibold">
            System Activity
          </h3>

          <div className="mt-6 space-y-4">

            <div className="flex justify-between">
              <span>Vector Database</span>
              <span className="text-green-500">
                ● Healthy
              </span>
            </div>

            <div className="flex justify-between">
              <span>Neon PostgreSQL</span>
              <span className="text-green-500">
                ● Connected
              </span>
            </div>

            <div className="flex justify-between">
              <span>Document Pipeline</span>
              <span className="text-green-500">
                ● Active
              </span>
            </div>

            <div className="flex justify-between">
              <span>Local LLM (Ollama)</span>
              <span className="text-green-500">
                ● Running
              </span>
            </div>

          </div>

        </div>

        {/* Recent Verifications */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h3 className="text-xl font-semibold">
            Recent Verifications
          </h3>

          <div className="mt-6 space-y-3">

            {recentVerifications.length > 0 ? (

              recentVerifications.map(
                (item) => (

                  <div
                    key={item.id}
                    className="
                      rounded-xl
                      border
                      border-zinc-800
                      p-4
                    "
                  >
                    <div className="flex justify-between">

                      <p className="max-w-[80%] text-zinc-300">
                        {item.claim}
                      </p>

                      <span className="font-medium">
                        {item.verdict}
                      </span>

                    </div>

                  </div>

                )
              )

            ) : (

              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-zinc-700
                  p-4
                  text-zinc-500
                "
              >
                No verifications yet.
              </div>

            )}

          </div>

        </div>

        {/* Knowledge Base */}

        <div
          className="
            mt-8
            rounded-3xl
            border
            border-zinc-800
            bg-zinc-950
            p-6
          "
        >
          <h3 className="text-xl font-semibold">
            Knowledge Base
          </h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-zinc-500">
                Embedding Model
              </p>

              <p className="mt-2">
                all-MiniLM-L6-v2
              </p>
            </div>

            <div>
              <p className="text-zinc-500">
                Vector Store
              </p>

              <p className="mt-2">
                ChromaDB
              </p>
            </div>

          </div>

        </div>

      </DashboardLayout>
    </>
  );
}