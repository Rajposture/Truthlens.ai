"use client";

import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Brain,
  FileText,
  CheckCircle2,
} from "lucide-react";

type Props = {
  result: any;
};

export default function VerdictCard({
  result,
}: Props) {

  const verdict =
    result?.verdict?.toLowerCase() || "";

  const isTrue =
    verdict === "true";

  const isFalse =
    verdict === "false";

  const confidence =
    result?.confidence || "Unknown";

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
        shadow-2xl
      "
    >

      {/* Top Banner */}

      <div
        className={`
          p-8
          border-b
          border-zinc-800
          ${
            isTrue
              ? "bg-green-500/10"
              : isFalse
              ? "bg-red-500/10"
              : "bg-yellow-500/10"
          }
        `}
      >

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-4">

            {isTrue ? (

              <ShieldCheck
                className="
                  h-12
                  w-12
                  text-green-500
                "
              />

            ) : isFalse ? (

              <ShieldX
                className="
                  h-12
                  w-12
                  text-red-500
                "
              />

            ) : (

              <AlertTriangle
                className="
                  h-12
                  w-12
                  text-yellow-500
                "
              />

            )}

            <div>

              <p className="text-zinc-500">
                Verification Result
              </p>

              <h2 className="text-4xl font-bold">
                {result.verdict}
              </h2>

            </div>

          </div>

          <div
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-black/30
              px-5
              py-4
            "
          >
            <p className="text-xs text-zinc-500">
              Confidence
            </p>

            <p className="mt-1 text-2xl font-bold">
              {confidence}
            </p>

          </div>

        </div>

      </div>

      {/* Main Content */}

      <div className="grid gap-6 p-6 lg:grid-cols-3">

        {/* Claim */}

        <div className="lg:col-span-2">

          <div
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900/40
              p-5
            "
          >

            <div className="flex items-center gap-2">

              <FileText
                className="
                  h-5
                  w-5
                  text-blue-500
                "
              />

              <h3 className="font-semibold">
                Claim
              </h3>

            </div>

            <p className="mt-4 text-zinc-300 leading-7">
              {result.claim}
            </p>

          </div>

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900/40
              p-5
            "
          >

            <div className="flex items-center gap-2">

              <Brain
                className="
                  h-5
                  w-5
                  text-cyan-400
                "
              />

              <h3 className="font-semibold">
                AI Analysis
              </h3>

            </div>

            <p className="mt-4 leading-8 text-zinc-300">
              {result.reasoning}
            </p>

          </div>

        </div>

        {/* Side Panel */}

        <div>

          <div
            className="
              rounded-2xl
              border
              border-zinc-800
              bg-zinc-900/40
              p-5
            "
          >

            <h3 className="font-semibold">
              Summary
            </h3>

            <div className="mt-5 space-y-4">

              <div>

                <p className="text-xs text-zinc-500">
                  Verdict
                </p>

                <p className="mt-1 font-medium">
                  {result.verdict}
                </p>

              </div>

              <div>

                <p className="text-xs text-zinc-500">
                  Confidence
                </p>

                <p className="mt-1 font-medium">
                  {confidence}
                </p>

              </div>

              <div>

                <p className="text-xs text-zinc-500">
                  Sources Used
                </p>

                <p className="mt-1 font-medium">
                  {result.evidence?.length || 0}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Evidence */}

      <div
        className="
          border-t
          border-zinc-800
          p-6
        "
      >

        <h3 className="mb-5 text-xl font-semibold">
          Supporting Evidence
        </h3>

        {result.evidence?.length ? (

          <div className="grid gap-4">

            {result.evidence.map(
              (
                item: any,
                index: number
              ) => (

                <div
                  key={index}
                  className="
                    rounded-2xl
                    border
                    border-zinc-800
                    bg-zinc-900/40
                    p-5
                  "
                >

                  <div className="flex items-start gap-3">

                    <CheckCircle2
                      className="
                        mt-1
                        h-5
                        w-5
                        text-green-500
                      "
                    />

                    <div className="flex-1">

                      <p className="leading-7 text-zinc-300">
                        {item.content}
                      </p>

                      {item.metadata && (

                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            gap-2
                          "
                        >

                          {item.metadata.source && (

                            <span
                              className="
                                rounded-full
                                border
                                border-zinc-700
                                px-3
                                py-1
                                text-xs
                                text-zinc-400
                              "
                            >
                              {item.metadata.source}
                            </span>

                          )}

                          {item.metadata.page && (

                            <span
                              className="
                                rounded-full
                                border
                                border-zinc-700
                                px-3
                                py-1
                                text-xs
                                text-zinc-400
                              "
                            >
                              Page {item.metadata.page}
                            </span>

                          )}

                        </div>

                      )}

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-zinc-700
              bg-zinc-900/20
              p-8
              text-center
            "
          >

            <AlertTriangle
              className="
                mx-auto
                mb-3
                h-8
                w-8
                text-yellow-500
              "
            />

            <p className="text-zinc-400">
              No supporting evidence found
              in the current knowledge base.
            </p>

          </div>

        )}

      </div>

    </div>
  );
}