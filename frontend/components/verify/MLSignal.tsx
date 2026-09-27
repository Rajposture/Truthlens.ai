import { BrainCircuit } from "lucide-react";
import { Badge, verdictTone } from "@/components/ui/primitives";
import { verdictLabel } from "@/lib/utils";
import type { MLPrediction } from "@/lib/types";

export function MLSignal({ prediction }: { prediction: MLPrediction }) {
  const entries = Object.entries(prediction.probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div className="rounded-[var(--radius-md)] border border-ink-800 bg-ink-950/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-text-faint">
          <BrainCircuit size={14} className="text-brass-400" />
          Trained ML model (independent signal)
        </span>
        <Badge tone={verdictTone(prediction.verdict)}>{verdictLabel(prediction.verdict)}</Badge>
      </div>

      {entries.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {entries.map(([label, pct]) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-text-muted">{label}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-800">
                <div
                  className="h-full rounded-full bg-brass-400"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-xs text-text-faint">
                {pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-text-faint">
        A TF-IDF + Logistic Regression classifier trained offline on the LIAR dataset
        (12.8K labeled political statements) — a separate, genuinely trained model, shown here
        alongside the AI reasoning above rather than blended into it.
      </p>
    </div>
  );
}
