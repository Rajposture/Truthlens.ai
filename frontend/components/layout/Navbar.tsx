"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ApertureMark } from "@/components/brand/ApertureMark";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/verify", label: "Verify" },
  { href: "/chat", label: "Assistant" },
  { href: "/knowledge", label: "Knowledge base" },
  { href: "/history", label: "History" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <ApertureMark size={30} />
          <span className="font-display text-[19px] font-semibold tracking-tight text-paper-100">
            TruthLens
            <span className="ml-1 text-brass-400">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-[var(--radius-sm)] px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "text-paper-100" : "text-text-muted hover:text-text-primary"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-brass-400"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/verify"
            className="rounded-[var(--radius-md)] border border-brass-400 bg-brass-400 px-4 py-2 text-sm font-medium text-ink-950 transition-shadow hover:shadow-[0_0_24px_-4px_rgba(201,162,75,0.55)]"
          >
            Verify a claim
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-ink-700 text-text-primary md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden border-b border-ink-800 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-3">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium",
                    pathname === link.href
                      ? "bg-ink-800 text-paper-100"
                      : "text-text-muted hover:bg-ink-800/60 hover:text-text-primary"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
