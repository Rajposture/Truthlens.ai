"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";

interface DocumentItem {
  filename: string;
  path: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const response = await api.get(
        "/documents/list"
      );

      setDocuments(
        response.data.documents || []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>

      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-4xl font-bold">
            Documents
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage uploaded files
          </p>
        </div>

      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 overflow-hidden">

        <table className="w-full">

          <thead className="bg-zinc-900">

            <tr>

              <th className="p-4 text-left">
                Filename
              </th>

              <th className="p-4 text-left">
                Path
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td
                  colSpan={2}
                  className="p-6 text-center text-zinc-500"
                >
                  Loading...
                </td>
              </tr>

            ) : documents.length === 0 ? (

              <tr>
                <td
                  colSpan={2}
                  className="p-6 text-center text-zinc-500"
                >
                  No documents found
                </td>
              </tr>

            ) : (

              documents.map((doc, index) => (

                <tr
                  key={index}
                  className="border-t border-zinc-800"
                >

                  <td className="p-4">
                    📄 {doc.filename}
                  </td>

                  <td className="p-4 text-zinc-500">
                    {doc.path}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </DashboardLayout>
  );
}