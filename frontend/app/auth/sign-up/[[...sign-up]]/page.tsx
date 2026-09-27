"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <SignUp
        routing="path"
        path="/auth/sign-up"
        signInUrl="/auth/sign-in"
        fallbackRedirectUrl="/verify"
      />
    </main>
  );
}
