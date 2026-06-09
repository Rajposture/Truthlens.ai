"use client";

import { useState } from "react";
import { Search, Sparkles, Brain } from "lucide-react";
import { motion } from "framer-motion";

import VerdictCard from "./VerdictCard";
import FileUpload from "./FileUpload";

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

  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

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

  setResult(
    response.data
  );

  const history =
    JSON.parse(
      localStorage.getItem(
        "truthlens-history"
      ) || "[]"
    );

  history.unshift({
    claim:
      response.data.claim,

    verdict:
      response.data.verdict,

    confidence:
      response.data.confidence,

    reasoning:
      response.data.reasoning,

    createdAt:
      new Date().toISOString(),
  });

  localStorage.setItem(
    "truthlens-history",
    JSON.stringify(history)
  );

} catch (error) {

  console.error(
    "Verification failed",
    error
  );

} finally {

  setLoading(false);

}


}

const quickPrompts = [
"Is climate change caused by humans?",
"Did Chandrayaan-3 land on the moon?",
"Can AI replace software engineers?",
"Analyze this research paper",
];

return ( <div className="mx-auto w-full max-w-6xl">


  <motion.div
    initial={{
      opacity: 0,
      y: 20,
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
      bg-zinc-950
      shadow-2xl
    "
  >

    {/* Header */}

    <div
      className="
        border-b
        border-zinc-800
        p-6
      "
    >

      <div className="flex items-center gap-3">

        <Brain className="h-6 w-6 text-blue-500" />

        <div>

          <h2 className="text-xl font-semibold">
            Verification Workspace
          </h2>

          <p className="text-sm text-zinc-500">
            Verify claims, reports,
            research papers and news.
          </p>

        </div>

      </div>

    </div>

    {/* Claim Input */}

    <div className="p-6">

      <textarea
        value={claim}
        onChange={(e) =>
          setClaim(
            e.target.value
          )
        }
        placeholder="Paste a claim, article, report, URL or statement to verify..."
        className="
          h-[260px]
          w-full
          resize-none
          rounded-3xl
          border
          border-zinc-800
          bg-black
          p-6
          text-zinc-100
          placeholder:text-zinc-500
          outline-none
          transition
          focus:border-blue-500
        "
      />

    </div>

    {/* Quick Prompts */}

    <div className="px-6">

      <p className="mb-3 text-sm text-zinc-500">
        Quick Examples
      </p>

      <div className="flex flex-wrap gap-3">

        {quickPrompts.map(
          (prompt) => (

            <button
              key={prompt}
              onClick={() =>
                setClaim(prompt)
              }
              className="
                rounded-full
                border
                border-zinc-800
                px-4
                py-2
                text-sm
                text-zinc-400
                transition
                hover:border-blue-500
                hover:text-white
              "
            >
              {prompt}
            </button>

          )
        )}

      </div>

    </div>

    {/* Upload */}

    <div className="p-6">

      <FileUpload
        file={file}
        uploaded={uploaded}
        uploading={uploading}
        onFileSelect={(file) => {
          setFile(file);
          setUploaded(false);
        }}
        onUpload={uploadPdf}
      />

    </div>

    {/* Action Bar */}

    <div
      className="
        border-t
        border-zinc-800
        bg-zinc-950
        p-6
      "
    >

      <div className="flex justify-end">

        <button
          onClick={verifyClaim}
          disabled={loading}
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-blue-600
            px-8
            py-4
            font-medium
            text-white
            transition
            hover:bg-blue-500
            disabled:opacity-50
          "
        >

          {loading ? (
            <>
              <Sparkles className="h-5 w-5 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Verify With AI
            </>
          )}

        </button>

      </div>

    </div>

  </motion.div>

  {result && (

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
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
