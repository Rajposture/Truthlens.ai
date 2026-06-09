"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Search,
  FileText,
  History,
  BarChart3,
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
];

export default function AppSidebar() {
  return (
    <aside
      className="
        w-64
        border-r
        border-zinc-800
        bg-zinc-950
        h-screen
        p-4
      "
    >
      <div className="mb-8">
        <h1
          className="
            text-2xl
            font-bold
            text-white
          "
        >
          TruthLens AI
        </h1>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-zinc-400
                hover:bg-zinc-900
                hover:text-white
                transition
              "
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}