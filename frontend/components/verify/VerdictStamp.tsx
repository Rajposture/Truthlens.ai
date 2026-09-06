"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Verdict } from "@/lib/types";

const STAMP_STYLES: Record<
  Verdict,
  { ring: string; ringInner: string; text: string; bg: string; label: string; Icon: typeof CheckCircle2 }
> = {
  True: {
    ring: "border-verified-500",
    ringInner: "border-verified-500/40",
    text: "text-verified-400",
    bg: "bg-verified-950",
    label: "Verified true",
    Icon: CheckCircle2,
  },
  False: {
    ring: "border-false-500",
    ringInner: "border-false-500/40",
    text: "text-false-400",
    bg: "bg-false-950",
    label: "Verified false",
    Icon: XCircle,
  },
  Misleading: {
    ring: "border-misleading-500",
    ringInner: "border-misleading-500/40",
    text: "text-misleading-400",
    bg: "bg-misleading-950",
    label: "Misleading",
    Icon: AlertTriangle,
  },
  Unverified: {
    ring: "border-unverified-500",
    ringInner: "border-unverified-500/40",
    text: "text-unverified-400",
    bg: "bg-unverified-950",
    label: "Unverified",
    Icon: HelpCircle,
  },
};

export function VerdictStamp({
  verdict,
  size = "lg",
  className,
}: {
  verdict: Verdict;
  size?: "sm" | "lg";
  className?: string;
}) {
  const style = STAMP_STYLES[verdict];
  const dims = size === "lg" ? "h-40 w-40 sm:h-48 sm:w-48" : "h-24 w-24";

  return (
    <motion.div
      initial={{ scale: 1.35, opacity: 0, rotate: 4 }}
      animate={{ scale: 1, opacity: 1, rotate: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 16, mass: 0.9 }}
      className={cn(
        "grain-overlay relative flex shrink-0 flex-col items-center justify-center rounded-full border-[3px] text-center",
        dims,
        style.ring,
        style.bg,
        className
      )}
    >
      <div className={cn("absolute inset-[7px] rounded-full border", style.ringInner)} />
      <style.Icon className={cn(size === "lg" ? "h-7 w-7" : "h-5 w-5", "mb-1.5", style.text)} strokeWidth={2} />
      <span
        className={cn(
          "font-display font-bold uppercase leading-[1.05] tracking-wide",
          size === "lg" ? "text-[15px] sm:text-base" : "text-[10px]",
          style.text
        )}
      >
        {style.label.split(" ").map((word, i) => (
          <span key={i} className="block">
            {word}
          </span>
        ))}
      </span>
    </motion.div>
  );
}
