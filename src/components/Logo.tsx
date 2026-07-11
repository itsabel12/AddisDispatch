import { cn } from "@/lib/utils";

type MarkProps = {
  /** Pixel size of the square mark. */
  size?: number;
  className?: string;
};

/**
 * AddisDispatch truck mark — a geometric box-truck in motion: a bold silhouette
 * (inherits the surrounding text color, so it reads on light AND dark surfaces)
 * with accent speed lines trailing behind it. Theme-aware and crisp at any size.
 */
export function TruckMark({ size = 28, className = "" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 32"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Speed lines (accent) — motion trailing the truck. */}
      <g className="text-accent">
        <path d="M2 11h11" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M0 17h8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M3 23h9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </g>

      {/* Truck body (inherits text color) — cargo box + cab. */}
      <g fill="currentColor">
        <rect x="15" y="7" width="15" height="15" rx="2" />
        <path d="M30 11h6.2a2 2 0 0 1 1.5.7l4.1 4.6a2 2 0 0 1 .5 1.3V22H30z" />
      </g>

      {/* Cab window (accent). */}
      <path
        d="M32.4 13.2h3.4l2.7 3H32.4z"
        className="text-accent"
        fill="currentColor"
      />

      {/* Wheels (inherit text color, hubs accent). */}
      <g fill="currentColor">
        <circle cx="21" cy="24.5" r="3.4" />
        <circle cx="37" cy="24.5" r="3.4" />
      </g>
      <g className="text-accent" fill="currentColor">
        <circle cx="21" cy="24.5" r="1.3" />
        <circle cx="37" cy="24.5" r="1.3" />
      </g>
    </svg>
  );
}

type LogoProps = {
  /** Pixel size of the mark. */
  size?: number;
  /** Show the "AddisDispatch" wordmark next to the mark. */
  wordmark?: boolean;
  className?: string;
  /** Extra classes for the wordmark text (e.g. font/size overrides per context). */
  wordmarkClassName?: string;
};

/**
 * AddisDispatch brand lockup — the truck mark plus the wordmark ("Dispatch" in
 * the brand accent). The mark inherits the parent text color; the wordmark's
 * "Addis" inherits too, so the lockup works on any surface.
 */
export default function Logo({
  size = 28,
  wordmark = true,
  className = "",
  wordmarkClassName = "",
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <TruckMark size={size} />
      {wordmark && (
        <span className={cn("font-display text-lg font-bold tracking-tight", wordmarkClassName)}>
          Addis<span className="text-accent">Dispatch</span>
        </span>
      )}
    </span>
  );
}
