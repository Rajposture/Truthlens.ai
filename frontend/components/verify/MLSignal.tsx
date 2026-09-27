import { BrainCircuit, Info, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/primitives";
import type { MLPrediction } from "@/lib/types";

function confidenceTone(level: MLPrediction["confidence_level"]) {
  if (level === "High") return "verified";
  if (level === "Medium") return "brass";
  return "neutral";
}

export function MLSignal({ prediction }: { prediction: MLPrediction }) {
  const entries = Object.entries(prediction.probabilities).sort((a, b) => b[1] - a[1]);
  const level = prediction.confidence_level || "Low";

  return (
    <div className="rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/50 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={16} className="text-brass-400" />
          <span className="font-mono text-xs uppercase tracking-wide text-text-faint">
            Supervised ML signal
          </span>
        </div>
        <Badge tone={confidenceTone(level)}>
          {prediction.uncertain ? "Low certainty" : `${level} confidence`}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-text-faint">Model prediction</p>
          <p className="mt-1 font-display text-2xl font-semibold text-paper-100">{prediction.verdict}</p>
          <p className="mt-1 text-xs text-text-muted">
            This is an independent statistical prediction, not an evidence-backed verification.
          </p>
        </div>
        <div className="rounded-[var(--radius-sm)] border border-ink-800 px-3 py-2 text-right">
          <p className="text-[10px] uppercase tracking-wider text-text-faint">Top class</p>
          <p className="font-mono text-lg text-text-primary">
            {prediction.confidence == null ? "n/a" : `${prediction.confidence.toFixed(1)}%`}
          </p>
        </div>
      </div>

      {entries.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {entries.map(([label, pct]) => (
            <div key={label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-text-muted">{label}</span>
                <span className="font-mono text-text-faint">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-brass-400 transition-[width] duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {prediction.uncertain && (
        <div className="mt-4 flex gap-2 rounded-[var(--radius-sm)] border border-ink-800 bg-ink-900/40 p-3">
          <ShieldAlert size={15} className="mt-0.5 shrink-0 text-misleading-400" />
          <p className="text-xs leading-relaxed text-text-muted">
            The model is uncertain here. The main verdict above remains evidence-driven and should
            not be replaced by this classifier.
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2 text-[11px] leading-relaxed text-text-faint">
        <Info size={13} className="mt-0.5 shrink-0" />
        <p>
          {prediction.model || "TF-IDF + Logistic Regression"} · baseline trained on LIAR political
          statements; adaptive samples are added only from high-confidence, evidence-backed
          verifications.
          {prediction.adaptive_samples ? ` ${prediction.adaptive_samples} adaptive samples collected.` : ""}
        </p>
      </div>
    </div>
  );
}
