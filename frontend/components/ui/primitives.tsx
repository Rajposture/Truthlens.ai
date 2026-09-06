"use client";

import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------------------- Button ---------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brass-400 text-ink-950 border border-brass-400 hover:bg-brass-300 hover:border-brass-300 shadow-[0_0_0_0_rgba(201,162,75,0)] hover:shadow-[0_0_24px_-4px_rgba(201,162,75,0.5)]",
  secondary:
    "bg-transparent text-text-primary border border-ink-700 hover:border-brass-400/60 hover:text-brass-300",
  ghost: "bg-transparent text-text-muted border border-transparent hover:text-text-primary hover:bg-ink-800/60",
  danger:
    "bg-transparent text-false-400 border border-false-900 hover:bg-false-950 hover:border-false-500/60",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5 rounded-[var(--radius-sm)]",
  md: "text-sm px-4 py-2.5 gap-2 rounded-[var(--radius-md)]",
  lg: "text-base px-6 py-3.5 gap-2.5 rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12 }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors duration-200 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
);
Button.displayName = "Button";

/* ---------------------------- IconButton ---------------------------- */

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-ink-700 text-text-muted",
        "transition-colors duration-150 hover:border-brass-400/50 hover:text-brass-300 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
IconButton.displayName = "IconButton";

/* ---------------------------- Badge ---------------------------- */

type BadgeTone = "verified" | "false" | "misleading" | "unverified" | "brass" | "neutral";

const badgeTones: Record<BadgeTone, string> = {
  verified: "bg-verified-950 text-verified-400 border-verified-900",
  false: "bg-false-950 text-false-400 border-false-900",
  misleading: "bg-misleading-950 text-misleading-400 border-misleading-900",
  unverified: "bg-unverified-950 text-unverified-400 border-unverified-900",
  brass: "bg-brass-400/10 text-brass-300 border-brass-400/30",
  neutral: "bg-ink-800 text-text-muted border-ink-700",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium tracking-wide",
        badgeTones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function verdictTone(verdict: string): BadgeTone {
  switch (verdict) {
    case "True":
      return "verified";
    case "False":
      return "false";
    case "Misleading":
      return "misleading";
    default:
      return "unverified";
  }
}

/* ---------------------------- Card ---------------------------- */

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("desk-surface rounded-[var(--radius-lg)] p-6", className)}>{children}</div>
  );
}

/* ---------------------------- Form fields ---------------------------- */

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full resize-none rounded-[var(--radius-md)] border border-ink-700 bg-ink-950/60 px-4 py-3.5",
        "text-[15px] leading-relaxed text-text-primary placeholder:text-text-faint",
        "outline-none transition-colors focus:border-brass-400/70",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-ink-700 bg-ink-950/60 px-4 py-2.5",
        "text-sm text-text-primary placeholder:text-text-faint",
        "outline-none transition-colors focus:border-brass-400/70",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
