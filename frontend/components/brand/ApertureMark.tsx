import { cn } from "@/lib/utils";

const BLADES = [
  "M43.00 24.00A19 19 0 0 1 35.17 39.37L31.79 28.50Z",
  "M33.50 40.45A19 19 0 0 1 16.27 41.36L16.21 28.50Z",
  "M14.50 40.45A19 19 0 0 1 5.10 25.99L24.00 15.00Z",
  "M5.00 24.00A19 19 0 0 1 12.83 8.63L31.79 28.50Z",
  "M14.50 7.55A19 19 0 0 1 31.73 6.64L16.21 28.50Z",
  "M33.50 7.55A19 19 0 0 1 42.90 22.01L24.00 15.00Z",
];

interface ApertureMarkProps {
  size?: number;
  animate?: boolean;
  ringed?: boolean;
  className?: string;
}

/** The TruthLens brand mark: a six-blade camera iris. Used as logo + scanning motif. */
export function ApertureMark({ size = 32, animate = false, ringed = true, className }: ApertureMarkProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {ringed && (
        <circle
          cx="24"
          cy="24"
          r="21.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.3"
          strokeWidth="1.2"
          className="text-ink-600"
        />
      )}
      <g className={cn("origin-center fill-brass-400", animate && "animate-spin-slow")}>
        {BLADES.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
