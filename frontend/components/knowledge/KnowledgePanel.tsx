"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, Trash2, Database, Layers, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import {
  uploadDocument,
  getDocuments,
  getKnowledgeStats,
  deleteDocument,
  clearKnowledgeBase,
  ApiError,
} from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import type { DocumentInfo, KnowledgeStats } from "@/lib/types";

const ACCEPTED = ".pdf,.txt,.md";

export function KnowledgePanel() {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    const [docs, kbStats] = await Promise.all([getDocuments(), getKnowledgeStats()]);
    setDocuments(docs);
    setStats(kbStats);
  }, []);

  useEffect(() => {
    // Initial data fetch on mount, not state derived synchronously from props/state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().catch(() => setError("Couldn't reach the backend to load the knowledge base."));
  }, [refresh]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadDocument(file);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDocument(id);
      await refresh();
    } catch {
      setError("Couldn't remove that document.");
    }
  }

  async function handleClearAll() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    try {
      await clearKnowledgeBase();
      await refresh();
    } catch {
      setError("Couldn't clear the knowledge base.");
    } finally {
      setConfirmClear(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={FileText} label="Your documents" value={stats?.documents ?? "—"} />
        <StatCard icon={Layers} label="Indexed chunks" value={stats?.chunks ?? "—"} />
        <StatCard
          icon={Sparkles}
          label="Starter facts"
          value={stats?.seeded ? "Loaded" : "Cleared"}
          tone={stats?.seeded ? "brass" : "neutral"}
        />
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`desk-surface flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border-dashed px-6 py-14 text-center transition-colors ${
          dragging ? "border-brass-400/70 bg-brass-400/5" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <Loader2 size={28} className="animate-spin text-brass-400" />
        ) : (
          <UploadCloud size={28} className="text-brass-400" />
        )}
        <div>
          <p className="text-sm font-medium text-text-primary">
            {uploading ? "Indexing document..." : "Drop a PDF, TXT, or Markdown file here"}
          </p>
          <p className="mt-1 text-xs text-text-faint">or click to browse — up to 15MB per file</p>
        </div>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-false-900 bg-false-950 px-4 py-3 text-sm text-false-400">
          {error}
        </p>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-paper-100">Uploaded sources</h2>
          {documents.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleClearAll}>
              <Trash2 size={13} />
              {confirmClear ? "Click again to confirm" : "Clear knowledge base"}
            </Button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="rounded-[var(--radius-md)] border border-dashed border-ink-700 px-4 py-8 text-center">
            <Database size={22} className="mx-auto text-ink-600" />
            <p className="mt-2 text-sm text-text-faint">
              No documents uploaded yet. TruthLens is still running on its starter reference facts.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc, i) => (
              <motion.li
                key={doc.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/40 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <FileText size={16} className="shrink-0 text-brass-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-text-primary">{doc.filename}</p>
                    <p className="text-xs text-text-faint">
                      {doc.chunks} chunks · {doc.size_kb}KB · {formatRelativeTime(doc.uploaded_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="shrink-0 text-text-faint transition-colors hover:text-false-400"
                  aria-label={`Remove ${doc.filename}`}
                >
                  <Trash2 size={15} />
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brass",
}: {
  icon: typeof FileText;
  label: string;
  value: string | number;
  tone?: "brass" | "neutral";
}) {
  return (
    <div className="desk-surface rounded-[var(--radius-lg)] p-5">
      <Icon size={18} className={tone === "brass" ? "text-brass-400" : "text-text-faint"} />
      <p className="mt-3 font-display text-2xl font-semibold text-paper-100">{value}</p>
      <p className="mt-0.5 text-xs text-text-faint">{label}</p>
    </div>
  );
}
