"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Search,
  FileText,
  History,
  BarChart3,
  Bot,
} from "lucide-react";

const items = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Verify",
    href: "/verify",
    icon: Search,
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    name: "AI Assistant",
    href: "/chat",
    icon: Bot,
  },
];

export default function AppSidebar() {

  const pathname =
    usePathname();

  const [expanded, setExpanded] =
    useState(false);

  return (
    <aside
      onMouseEnter={() =>
        setExpanded(true)
      }
      onMouseLeave={() =>
        setExpanded(false)
      }
      className={`
        relative
        h-screen
        border-r
        border-zinc-800
        bg-zinc-950/95
        backdrop-blur-xl
        transition-all
        duration-300
        ease-in-out
        ${
          expanded
            ? "w-72"
            : "w-20"
        }
      `}
    >

      {/* Logo */}

      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-zinc-800
          px-5
          py-5
        "
      >

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-gradient-to-br
            from-blue-500
            to-cyan-500
            text-white
            font-bold
          "
        >
          T
        </div>

        <div
          className={`
            overflow-hidden
            transition-all
            duration-300
            ${
              expanded
                ? "opacity-100 w-auto"
                : "opacity-0 w-0"
            }
          `}
        >
          <h1 className="font-bold text-white">
            TruthLens AI
          </h1>

          <p className="text-xs text-zinc-500">
            Intelligence Platform
          </p>
        </div>

      </div>

      {/* Navigation */}

      <nav className="p-3">

        <div className="space-y-2">

          {items.map((item) => {

            const Icon =
              item.icon;

            const active =
              pathname ===
              item.href;

            return (

              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  px-4
                  py-3
                  transition-all
                  duration-200
                  ${
                    active
                      ? `
                        bg-blue-500/10
                        text-blue-400
                        border
                        border-blue-500/20
                      `
                      : `
                        text-zinc-400
                        hover:bg-zinc-900
                        hover:text-white
                      `
                  }
                `}
              >

                <Icon
                  className={`
                    h-5
                    w-5
                    shrink-0
                    ${
                      item.name ===
                      "AI Assistant"
                        ? "text-cyan-400"
                        : ""
                    }
                  `}
                />

                <span
                  className={`
                    whitespace-nowrap
                    overflow-hidden
                    transition-all
                    duration-300
                    ${
                      expanded
                        ? "opacity-100"
                        : "opacity-0 w-0"
                    }
                  `}
                >
                  {item.name}
                </span>

              </Link>

            );
          })}

        </div>

      </nav>

      {/* Bottom AI Badge */}

      <div
        className="
          absolute
          bottom-5
          left-3
          right-3
        "
      >

        <div
          className="
            rounded-2xl
            border
            border-cyan-900
            bg-cyan-950/20
            p-3
          "
        >

          <div className="flex items-center gap-3">

            <Bot className="h-5 w-5 text-cyan-400" />

            {expanded && (

              <div>

                <p className="text-sm font-medium text-white">
                  AI Assistant
                </p>

                <p className="text-xs text-zinc-500">
                  RAG + Ollama
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </aside>
  );
}