"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-8">

        <h1 className="text-4xl font-bold text-center">
          TruthLens AI
        </h1>

        <p className="mt-4 text-center text-zinc-400">
          Verify news, reports and claims with AI.
        </p>

        <div className="mt-8 space-y-3">

          <Link href="/auth/sign-in">
            <button className="w-full rounded-xl bg-blue-600 py-3">
              Sign In
            </button>
          </Link>

          <Link href="/auth/sign-up">
            <button className="w-full rounded-xl border border-zinc-700 py-3">
              Create Account
            </button>
          </Link>

        </div>

      </div>

    </main>
  );
}