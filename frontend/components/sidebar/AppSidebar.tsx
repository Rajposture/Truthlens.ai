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
className={`         relative
        h-screen
        shrink-0
        border-r
        border-white/10
        bg-white/[0.03]
        backdrop-blur-2xl
        transition-all
        duration-300
        ease-in-out
        overflow-hidden
        ${
          expanded
            ? "w-64"
            : "w-20"
        }
      `}
>
{/* Glow */}


  <div
    className="
      absolute
      inset-0
      bg-gradient-to-b
      from-orange-500/[0.03]
      via-transparent
      to-transparent
      pointer-events-none
    "
  />

  {/* Logo */}

  <div
    className="
      relative
      z-10
      flex
      items-center
      gap-3
      border-b
      border-white/10
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
        from-orange-500
        to-orange-400
        text-white
        font-bold
        shadow-lg
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
      <h1 className="font-semibold text-white">
        TruthLens AI
      </h1>

      <p className="text-xs text-white/50">
        Intelligence Platform
      </p>
    </div>
  </div>

  {/* Navigation */}

  <nav className="relative z-10 p-3">
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
              group
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
                    border
                    border-orange-500/20
                    bg-orange-500/10
                    text-orange-300
                    backdrop-blur-xl
                  `
                  : `
                    text-white/70
                    hover:bg-white/[0.04]
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
                    ? "text-orange-400"
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

  {/* Bottom Assistant Card */}

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
        border-orange-500/20
        bg-orange-500/[0.05]
        backdrop-blur-xl
        p-3
      "
    >
      <div className="flex items-center gap-3">
        <Bot className="h-5 w-5 text-orange-400" />

        {expanded && (
          <div>
            <p className="text-sm font-medium text-white">
              AI Assistant
            </p>

            <p className="text-xs text-white/50">
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
