import {
  ShieldCheck,
  ShieldX,
  AlertTriangle,
} from "lucide-react";

type Props = {
  result: any;
};

export default function VerdictCard({
  result,
}: Props) {
  const verdict =
    result.verdict?.toLowerCase();

  const isTrue =
    verdict === "true";

  const isFalse =
    verdict === "false";

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-800
        bg-zinc-950
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
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {isTrue ? (
            <ShieldCheck
              className="
                h-8
                w-8
                text-green-500
              "
            />
          ) : isFalse ? (
            <ShieldX
              className="
                h-8
                w-8
                text-red-500
              "
            />
          ) : (
            <AlertTriangle
              className="
                h-8
                w-8
                text-yellow-500
              "
            />
          )}

          <div>
            <p
              className="
                text-sm
                text-zinc-500
              "
            >
              Verdict
            </p>

            <h2
              className="
                text-3xl
                font-bold
              "
            >
              {result.verdict}
            </h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="
          p-6
          space-y-6
        "
      >
        {/* Confidence */}
        <div>
          <p
            className="
              text-sm
              text-zinc-500
            "
          >
            Confidence
          </p>

          <p
            className="
              mt-1
              text-lg
              font-semibold
            "
          >
            {result.confidence}
          </p>
        </div>

        {/* Claim */}
        <div>
          <p
            className="
              text-sm
              text-zinc-500
            "
          >
            Claim
          </p>

          <p
            className="
              mt-2
              text-zinc-200
            "
          >
            {result.claim}
          </p>
        </div>

        {/* Analysis */}
        <div>
          <p
            className="
              text-sm
              text-zinc-500
            "
          >
            Analysis
          </p>

          <p
            className="
              mt-2
              leading-7
              text-zinc-300
            "
          >
            {result.reasoning}
          </p>
        </div>

        {/* Evidence */}
        <div>
          <p
            className="
              mb-3
              text-sm
              text-zinc-500
            "
          >
            Evidence
          </p>

          {result.evidence?.length ? (
            <div className="space-y-3">
              {result.evidence.map(
                (
                  item: any,
                  index: number
                ) => (
                  <div
                    key={index}
                    className="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-900/40
                      p-4
                    "
                  >
                    <p
                      className="
                        text-sm
                        text-zinc-300
                      "
                    >
                      {item.content ||
                        JSON.stringify(
                          item
                        )}
                    </p>

                    {item.metadata && (
                      <div
                        className="
                          mt-3
                          text-xs
                          text-zinc-500
                        "
                      >
                        {item.metadata
                          .source && (
                          <p>
                            Source:{" "}
                            {
                              item
                                .metadata
                                .source
                            }
                          </p>
                        )}

                        {item.metadata
                          .page && (
                          <p>
                            Page:{" "}
                            {
                              item
                                .metadata
                                .page
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              className="
                rounded-xl
                border
                border-dashed
                border-zinc-700
                p-4
                text-sm
                text-zinc-500
              "
            >
              No supporting evidence
              available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}