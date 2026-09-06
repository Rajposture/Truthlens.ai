"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, Clock, Trash2, ScrollText } from "lucide-react";
import { Badge, Button, verdictTone } from "@/components/ui/primitives";
import { EvidenceList } from "@/components/verify/EvidenceList";
import { getHistory, clearHistory } from "@/lib/api";
import { cn, formatRelativeTime, verdictLabel } from "@/lib/utils";
import type { VerdictResult, Verdict } from "@/lib/types";

const VERDICT_COLORS: Record<Verdict, string> = {
  True: "#3fa796",
  False: "#c1443a",
  Misleading: "#c98a3b",
  Unverified: "#6b7280",
};

export function HistoryPanel() {
  const [items, setItems] = useState<VerdictResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    getHistory(200)
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const counts: Record<Verdict, number> = { True: 0, False: 0, Misleading: 0, Unverified: 0 };
    items.forEach((item) => counts[item.verdict]++);
    return (Object.keys(counts) as Verdict[])
      .filter((v) => counts[v] > 0)
      .map((v) => ({ name: verdictLabel(v), value: counts[v], color: VERDICT_COLORS[v] }));
  }, [items]);

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 4000);
      return;
    }
    await clearHistory();
    setItems([]);
    setConfirmClear(false);
  }

  if (loading) {
    return <p className="py-16 text-center text-sm text-text-faint">Loading history...</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-ink-700 px-6 py-16 text-center">
        <ScrollText size={26} className="mx-auto text-ink-600" />
        <p className="mt-3 text-sm text-text-faint">
          Nothing verified yet. Results from the Verify page will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="desk-surface flex flex-col items-center gap-6 rounded-[var(--radius-lg)] p-6 sm:flex-row">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#10161f",
                  border: "1px solid #1c2530",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "#ece9e0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-1 flex-wrap gap-x-8 gap-y-3">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: entry.color }} />
              <span className="text-sm text-text-muted">
                {entry.name} <span className="text-text-primary">({entry.value})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-paper-100">
            {items.length} claim{items.length === 1 ? "" : "s"} checked
          </h2>
          <Button variant="danger" size="sm" onClick={handleClear}>
            <Trash2 size={13} />
            {confirmClear ? "Click again to confirm" : "Clear history"}
          </Button>
        </div>

        <ul className="space-y-2">
          {items.map((item) => {
            const isOpen = expanded === item.id;
            return (
              <li key={item.id} className="desk-surface overflow-hidden rounded-[var(--radius-md)]">
                <button
                  onClick={() => setExpanded(isOpen ? null : item.id)}
                  className="flex w-full items-center gap-4 px-4 py-3.5 text-left"
                >
                  <Badge tone={verdictTone(item.verdict)}>{verdictLabel(item.verdict)}</Badge>
                  <p className="min-w-0 flex-1 truncate text-sm text-text-primary">{item.claim}</p>
                  <span className="hidden shrink-0 items-center gap-1 font-mono text-xs text-text-faint sm:flex">
                    <Clock size={12} />
                    {formatRelativeTime(item.created_at)}
                  </span>
                  <ChevronDown
                    size={16}
                    className={cn("shrink-0 text-text-faint transition-transform", isOpen && "rotate-180")}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-ink-800"
                    >
                      <div className="px-4 py-4">
                        <p className="text-sm leading-relaxed text-text-muted">{item.reasoning}</p>
                        {item.key_points.length > 0 && (
                          <ul className="mt-3 space-y-1.5">
                            {item.key_points.map((point, i) => (
                              <li key={i} className="flex gap-2 text-sm text-text-muted">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass-400" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-4">
                          <EvidenceList evidence={item.evidence} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
