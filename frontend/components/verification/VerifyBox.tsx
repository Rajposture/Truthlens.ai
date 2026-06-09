"use client";

import { useState } from "react";
import {
  Upload,
  Search,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import VerdictCard from "./VerdictCard";
import { api } from "@/lib/api";

interface VerificationResult {
  claim: string;
  verdict: string;
  confidence: string | number;
  reasoning: string;
  evidence: any[];
}

export default function VerifyBox() {
  const [claim, setClaim] = useState("");
  const [result, setResult] =
    useState<VerificationResult | null>(
      null
    );

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(null);

  const [uploaded, setUploaded] =
    useState(false);

  async function uploadPdf() {
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await api.post(
          "/documents/upload",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log(
        "UPLOAD RESPONSE",
        response.data
      );

      setUploaded(true);
    } catch (error) {
      console.error(
        "Upload failed",
        error
      );
    } finally {
      setUploading(false);
    }
  }

 async function verifyClaim() {
  if (!claim.trim()) return;

  try {
    setLoading(true);

    const response =
      await api.post(
        "/verify",
        {
          claim,
        }
      );

    console.log(
      "VERIFY RESPONSE:",
      response.data
    );

    setResult(
      response.data
    );

    try {

      const history =
        JSON.parse(
          localStorage.getItem(
            "truthlens-history"
          ) || "[]"
        );

      const historyItem = {
        claim:
          response.data.claim ??
          claim,

        verdict:
          response.data.verdict ??
          "Unknown",

        confidence:
          response.data.confidence ??
          "Unknown",

        reasoning:
          response.data.reasoning ??
          "",

        createdAt:
          new Date().toISOString(),
      };

      history.unshift(
        historyItem
      );

      localStorage.setItem(
        "truthlens-history",
        JSON.stringify(
          history
        )
      );

      console.log(
        "History Saved:",
        history
      );

    } catch (storageError) {

      console.error(
        "LocalStorage Error:",
        storageError
      );

    }

  } catch (error) {

    console.error(
      "Verification failed",
      error
    );

  } finally {

    setLoading(false);

  }
}
  

  return (
    <div className="w-full max-w-5xl mx-auto">

      <motion.div
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
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
            setClaim(
              e.target.value
            )
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
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-zinc-800
                bg-zinc-900/50
                p-3
              "
            >
              <span
                className="
                  text-sm
                  text-zinc-400
                "
              >
                📄 {file.name}
              </span>

              {uploaded && (
                <span
                  className="
                    flex
                    items-center
                    gap-1
                    text-xs
                    text-green-500
                  "
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Indexed
                </span>
              )}
            </div>
          </div>
        )}

        <div
          className="
            border-t
            border-zinc-800
            px-5
            py-4
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div className="flex gap-2">

              <label>
                <input
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={(
                    e
                  ) => {
                    const selected =
                      e.target
                        .files?.[0];

                    if (
                      selected
                    ) {
                      setFile(
                        selected
                      );
                      setUploaded(
                        false
                      );
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
                    Select PDF
                  </span>
                </Button>
              </label>

              {file && (
                <Button
                  variant="outline"
                  onClick={
                    uploadPdf
                  }
                  disabled={
                    uploading ||
                    uploaded
                  }
                >
                  {uploading
                    ? "Uploading..."
                    : uploaded
                    ? "Indexed"
                    : "Upload"}
                </Button>
              )}

            </div>

            <Button
              onClick={
                verifyClaim
              }
              disabled={
                loading
              }
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