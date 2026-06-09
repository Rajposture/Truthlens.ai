"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";

export default function ReportsPage() {

  const [reports, setReports] =
    useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {

    const response =
      await api.get(
        "/reports"
      );

    setReports(
      response.data
    );
  }

  return (
    <DashboardLayout>

      <h1 className="text-4xl font-bold">
        Reports
      </h1>

      <div className="mt-8 space-y-4">

        {reports.map(
          (
            report,
            index
          ) => (

            <div
              key={index}
              className="
                rounded-2xl
                border
                border-zinc-800
                p-5
              "
            >
              <h3 className="font-semibold">
                {report.claim}
              </h3>

              <p className="mt-2 text-zinc-400">
                {report.verdict}
              </p>

              <p className="mt-3 text-sm text-zinc-500">
                {report.confidence}
              </p>
            </div>

          )
        )}

      </div>

    </DashboardLayout>
  );
}