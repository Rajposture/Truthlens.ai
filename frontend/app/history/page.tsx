"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface HistoryItem {
  claim: string;
  verdict: string;
  confidence?: string | number;
  reasoning?: string;
  createdAt?: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<
    HistoryItem[]
  >([]);

  useEffect(() => {
    try {
      const data =
        localStorage.getItem(
          "truthlens-history"
        );

      console.log(
        "History from storage:",
        data
      );

      if (data) {
        setHistory(
          JSON.parse(data)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load history",
        error
      );
    }
  }, []);

  return (
    <DashboardLayout>

      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          History
        </h1>

        <p className="mt-2 text-zinc-500">
          Previously verified claims
        </p>
      </div>

      {history.length === 0 ? (

        <div
          className="
            rounded-2xl
            border
            border-zinc-800
            p-8
            text-center
            text-zinc-500
          "
        >
          No verification history found.
        </div>

      ) : (

        <div className="space-y-4">

          {history.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="
                  rounded-2xl
                  border
                  border-zinc-800
                  bg-zinc-950
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>

                    <h3
                      className="
                        text-lg
                        font-semibold
                      "
                    >
                      {item.claim}
                    </h3>

                    {item.createdAt && (
                      <p
                        className="
                          mt-2
                          text-xs
                          text-zinc-500
                        "
                      >
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>
                    )}

                  </div>

                  <span
                    className={`
                      rounded-full
                      px-3
                      py-1
                      text-sm
                      font-medium
                      ${
                        item.verdict?.toLowerCase() ===
                        "true"
                          ? "bg-green-500/20 text-green-400"
                          : item.verdict?.toLowerCase() ===
                            "false"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }
                    `}
                  >
                    {item.verdict}
                  </span>

                </div>
              </div>

            )
          )}

        </div>

      )}

    </DashboardLayout>
  );
}