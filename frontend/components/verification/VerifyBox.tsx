"use client";

import { useState } from "react";
import { Upload, Search, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import VerdictCard from "./VerdictCard";
import { api } from "@/lib/api";

interface VerificationResult {
  claim: string;
  verdict: string;
  confidence: string | number;
  reasoning: string;
  evidence: string[];
}

export default function VerifyBox() {
  const [claim, setClaim] = useState<string>("");

  const [result, setResult] =
    useState<VerificationResult | null>(null);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [file, setFile] =
    useState<File | null>(null);

  async function uploadPdf() {
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    await api.post(
      "/documents/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async function verifyClaim() {
    if (!claim.trim()) return;

    try {
      setLoading(true);

      if (file) {
        await uploadPdf();
      }

      const response = await api.post(
        "/verify",
        {
          claim,
        }
      );

      setResult(response.data);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          overflow-hidden
          rounded-[32px]
          border
          border-zinc-800
          bg-zinc-950/90
          backdrop-blur-xl
          shadow-2xl
        "
      >

        <textarea
          value={claim}
          onChange={(e) =>
            setClaim(e.target.value)
          }
          placeholder="Paste a claim, article, report, or URL to verify..."
          className="
            min-h-[220px]
            w-full
            resize-none
            bg-transparent
            px-6
            py-6
            text-zinc-100
            placeholder:text-zinc-500
            outline-none
          "
        />

        {file && (
          <div className="px-6 pb-4">
            <div
              className="
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-3
                text-sm
                text-zinc-400
              "
            >
              📄 {file.name}
            </div>
          </div>
        )}

        <div className="border-t border-zinc-800 px-5 py-4">

          <div className="flex items-center justify-between">

            <label>

              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => {
                  const selected =
                    e.target.files?.[0];

                  if (selected) {
                    setFile(selected);
                  }
                }}
              />

              <Button
                variant="outline"
                className="border-zinc-700"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-4 w-4" />
                  {file
                    ? file.name
                    : "Upload PDF"}
                </span>
              </Button>

            </label>

            <Button
              onClick={verifyClaim}
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading ? (
                <>
                  <Sparkles
                    className="
                      mr-2
                      h-4
                      w-4
                      animate-pulse
                    "
                  />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>

          </div>

        </div>

      </motion.div>

      {result && (
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mt-8"
        >
          <VerdictCard
            result={result}
          />
        </motion.div>
      )}

    </div>
  );
}