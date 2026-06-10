"use client";

import { Moon, Sun } from "lucide-react";

interface Props {
  dark: boolean;
  toggle: () => void;
}

export default function ThemeToggle({
  dark,
  toggle,
}: Props) {
  return (
    <button
      onClick={toggle}
      className="
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-xl
        border
        border-zinc-800
        bg-zinc-950/80
        backdrop-blur-md
        transition
      "
    >
      {dark ? (
        <Sun size={18} />
      ) : (
        <Moon size={18} />
      )}
    </button>
  );
}