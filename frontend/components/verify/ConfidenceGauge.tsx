"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

const STROKE_BY_VERDICT: Record<Verdict, string> = {
  True: "stroke-verified-400",
  False: "stroke-false-400",
  Misleading: "stroke-misleading-400",
  Unverified: "stroke-unverified-400",
};

const TEXT_BY_VERDICT: Record<Verdict, string> = {
  True: "text-verified-400",
  False: "text-false-400",
  Misleading: "text-misleading-400",
  Unverified: "text-unverified-400",
};

const SIZE = 148;
const CENTER = SIZE / 2;
const RADIUS = 58;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TICKS = Array.from({ length: 36 }, (_, i) => {
  const angle = (i * 360) / 36 - 90;
  const rad = (angle * Math.PI) / 180;
  const long = i % 3 === 0;
  const outer = 70;
  const inner = long ? 63 : 66.5;
  return {
    x1: CENTER + outer * Math.cos(rad),
    y1: CENTER + outer * Math.sin(rad),
    x2: CENTER + inner * Math.cos(rad),
    y2: CENTER + inner * Math.sin(rad),
  };
});

export function ConfidenceGauge({ confidence, verdict }: { confidence: number; verdict: Verdict }) {
  const animated = useCountUp(confidence, 1100);
  const offset = CIRCUMFERENCE * (1 - confidence / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-0">
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} className="stroke-ink-700" strokeWidth={1.5} />
        ))}
      </svg>

      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 -rotate-90">
        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" className="stroke-ink-800" strokeWidth={7} />
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          strokeWidth={7}
          strokeLinecap="round"
          className={cn(STROKE_BY_VERDICT[verdict])}
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>

      <div className="flex flex-col items-center">
        <span className={cn("font-display text-3xl font-bold tabular-nums", TEXT_BY_VERDICT[verdict])}>
          {animated}%
        </span>
        <span className="mt-0.5 text-[11px] uppercase tracking-wider text-text-faint">Confidence</span>
      </div>
    </div>
  );
}
