"use client";

import { FileText, Layers, Calendar, Trash2 } from "lucide-react";
import type { DocumentInfo } from "@/lib/types";

interface Props {
  documents: DocumentInfo[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DocumentsTable({ documents, loading = false, onDelete, deletingId }: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold">Document Library</h2>
          <p className="mt-1 text-sm text-zinc-500">Indexed files available in TruthLens&apos;s knowledge base</p>
        </div>
        <div className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400">
          {documents.length} document{documents.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="p-4 text-left">Document</th>
              <th className="p-4 text-left">Chunks indexed</th>
              <th className="p-4 text-left">Size</th>
              <th className="p-4 text-left">Uploaded</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">
                  Loading documents...
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-zinc-500">
                  No indexed documents found
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc.id} className="border-b border-zinc-800/50 transition hover:bg-zinc-900/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-500/10 p-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <p className="font-medium">{doc.filename}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Layers className="h-4 w-4" />
                      <span className="text-sm">{doc.chunks}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-zinc-400">{doc.size_kb.toFixed(1)} KB</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                      Indexed
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => onDelete?.(doc.id)}
                      disabled={deletingId === doc.id}
                      aria-label={`Remove ${doc.filename}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === doc.id ? "Removing..." : "Remove"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
