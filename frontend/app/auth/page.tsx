"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <SignIn
        routing="path"
        path="/auth/sign-in"
        signUpUrl="/auth/sign-up"
        fallbackRedirectUrl="/verify"
      />
    </main>
  );
}
