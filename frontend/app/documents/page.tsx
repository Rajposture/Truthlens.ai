"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { api } from "@/lib/api";
import {
  FileText,
  Database,
  FolderOpen,
  Search,
} from "lucide-react";

interface DocumentItem {
  filename: string;
  path: string;
}

export default function DocumentsPage() {

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {

    try {

      const response =
        await api.get(
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

  const filteredDocs =
    documents.filter(
      (doc) =>
        doc.filename
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* Header */}

        <div>

          <h1 className="text-4xl font-bold">
            Documents
          </h1>

          <p className="mt-2 text-zinc-500">
            Manage and explore
            indexed documents inside
            TruthLens AI.
          </p>

        </div>

        {/* Stats */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <div className="flex items-center gap-3">

              <FolderOpen className="h-5 w-5 text-blue-500" />

              <p className="text-zinc-400">
                Documents
              </p>

            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {documents.length}
            </h2>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <div className="flex items-center gap-3">

              <Database className="h-5 w-5 text-green-500" />

              <p className="text-zinc-400">
                Indexed
              </p>

            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {documents.length}
            </h2>

          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">

            <div className="flex items-center gap-3">

              <FileText className="h-5 w-5 text-purple-500" />

              <p className="text-zinc-400">
                Knowledge Sources
              </p>

            </div>

            <h2 className="mt-4 text-3xl font-bold">
              {documents.length}
            </h2>

          </div>

        </div>

        {/* Search */}

        <div className="relative">

          <Search className="absolute left-4 top-3 h-5 w-5 text-zinc-500" />

          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              rounded-xl
              border
              border-zinc-800
              bg-zinc-950
              py-3
              pl-12
              pr-4
              text-white
              outline-none
            "
          />

        </div>

        {/* Documents Grid */}

        {loading ? (

          <div className="rounded-2xl border border-zinc-800 p-10 text-center text-zinc-500">
            Loading documents...
          </div>

        ) : filteredDocs.length === 0 ? (

          <div className="rounded-2xl border border-zinc-800 p-10 text-center text-zinc-500">
            No documents found.
          </div>

        ) : (

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

            {filteredDocs.map(
              (
                doc,
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
                    transition
                    hover:border-blue-500
                  "
                >

                  <div className="flex items-start gap-3">

                    <FileText className="mt-1 h-5 w-5 text-blue-500" />

                    <div>

                      <h3 className="font-semibold break-all">
                        {doc.filename}
                      </h3>

                      <p className="mt-2 text-xs text-zinc-500 break-all">
                        {doc.path}
                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </DashboardLayout>
  );
}