import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "TruthLens AI",
  description: "AI-powered fact verification and evidence analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider afterSignOutUrl="/" signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}