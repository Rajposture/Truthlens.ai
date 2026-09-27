"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DocumentsTable from "@/components/documents/DocumentsTable";

import { getDocuments, uploadDocument, deleteDocument, ApiError } from "@/lib/api";
import type { DocumentInfo } from "@/lib/types";

import { Database, FileText, FolderOpen, Search, Upload, Loader2 } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments();
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      await uploadDocument(file);
      await loadDocuments();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    setError(null);
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not remove document.");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.filename?.toLowerCase().includes(search.toLowerCase())
  );
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunks || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold">Document Intelligence Hub</h1>
              <p className="mt-3 max-w-2xl text-zinc-400">
                Upload PDFs, text, or Markdown files to expand the BM25 knowledge base TruthLens retrieves
                evidence from when verifying claims.
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.md"
              onChange={handleFileSelected}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-blue-500" />
              <span className="text-zinc-400">Documents</span>
            </div>
            <h2 className="mt-4 text-5xl font-bold">{documents.length}</h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-green-500" />
              <span className="text-zinc-400">Chunks indexed</span>
            </div>
            <h2 className="mt-4 text-5xl font-bold">{totalChunks}</h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-purple-500" />
              <span className="text-zinc-400">Knowledge base</span>
            </div>
            <h2 className="mt-4 text-5xl font-bold">Active</h2>
          </div>
        </div>

        {/* Search */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            placeholder="Search documents..."
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent py-4 pl-12 pr-4 outline-none"
          />
        </div>

        {/* Content */}
        {!loading && filteredDocuments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-700 bg-zinc-950 p-14 text-center">
            <FileText className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="mt-4 text-xl font-semibold">No documents found</h3>
            <p className="mt-2 text-zinc-500">Upload PDFs or text files to build your knowledge base.</p>
          </div>
        ) : (
          <DocumentsTable
            documents={filteredDocuments}
            loading={loading}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
