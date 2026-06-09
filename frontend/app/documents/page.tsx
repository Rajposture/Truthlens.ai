"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DocumentsTable from "@/components/documents/DocumentsTable";

import { api } from "@/lib/api";

import {
  Database,
  FileText,
  FolderOpen,
  Search,
  Upload,
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

      console.error(
        "Failed loading docs",
        error
      );

    } finally {

      setLoading(false);

    }
  }

  const filteredDocuments =
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

        {/* Hero */}

        <div
          className="
            overflow-hidden
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
                Document Intelligence Hub
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Manage uploaded PDFs,
                reports, research papers,
                and knowledge sources
                powering TruthLens AI.
              </p>

            </div>

            <button
              className="
                flex
                items-center
                gap-2
                rounded-2xl
                bg-blue-600
                px-5
                py-3
                font-medium
                transition
                hover:bg-blue-500
              "
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </button>

          </div>

        </div>

        {/* Stats */}

        <div className="grid gap-5 md:grid-cols-3">

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-6
            "
          >

            <div className="flex items-center gap-3">

              <FolderOpen className="h-5 w-5 text-blue-500" />

              <span className="text-zinc-400">
                Documents
              </span>

            </div>

            <h2 className="mt-4 text-5xl font-bold">
              {documents.length}
            </h2>

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

            <div className="flex items-center gap-3">

              <Database className="h-5 w-5 text-green-500" />

              <span className="text-zinc-400">
                Indexed Sources
              </span>

            </div>

            <h2 className="mt-4 text-5xl font-bold">
              {documents.length}
            </h2>

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

            <div className="flex items-center gap-3">

              <FileText className="h-5 w-5 text-purple-500" />

              <span className="text-zinc-400">
                Knowledge Base
              </span>

            </div>

            <h2 className="mt-4 text-5xl font-bold">
              Active
            </h2>

          </div>

        </div>

        {/* Search */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-zinc-800
            bg-zinc-950
          "
        >

          <Search
            className="
              absolute
              left-4
              top-1/2
              h-5
              w-5
              -translate-y-1/2
              text-zinc-500
            "
          />

          <input
            type="text"
            value={search}
            placeholder="
              Search documents...
            "
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className="
              w-full
              bg-transparent
              py-4
              pl-12
              pr-4
              outline-none
            "
          />

        </div>

        {/* Content */}

        {loading ? (

          <div
            className="
              rounded-3xl
              border
              border-zinc-800
              bg-zinc-950
              p-10
              text-center
            "
          >
            Loading documents...
          </div>

        ) : filteredDocuments.length === 0 ? (

          <div
            className="
              rounded-3xl
              border
              border-dashed
              border-zinc-700
              bg-zinc-950
              p-14
              text-center
            "
          >

            <FileText
              className="
                mx-auto
                h-10
                w-10
                text-zinc-600
              "
            />

            <h3 className="mt-4 text-xl font-semibold">
              No Documents Found
            </h3>

            <p className="mt-2 text-zinc-500">
              Upload PDFs or ingest
              documents to build your
              knowledge base.
            </p>

          </div>

        ) : (

          <DocumentsTable
            documents={
              filteredDocuments
            }
            loading={loading}
          />

        )}

      </div>

    </DashboardLayout>
  );
}