type LogoProps = {
  /** Pixel size of the glyph. */
  size?: number;
  /** Show the "AddisDispatch" wordmark next to the mark. */
  wordmark?: boolean;
  className?: string;
};

/**
 * AddisDispatch brand mark — an abstract route/node glyph (origin node →
 * waypoint → destination ring with a forward chevron) in orange, paired with
 * the wordmark set in the display face.
 */
export default function Logo({ size = 28, wordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="text-accent"
        aria-hidden="true"
      >
        {/* route path */}
        <path
          d="M7 25c6 0 5.5-13 12-15"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* origin node */}
        <circle cx="7" cy="25" r="3.2" fill="currentColor" />
        {/* waypoint */}
        <circle cx="14.5" cy="18.5" r="1.7" fill="currentColor" opacity="0.55" />
        {/* destination ring */}
        <circle cx="19" cy="10" r="3.2" fill="none" stroke="currentColor" strokeWidth="2.4" />
        {/* forward chevron */}
        <path
          d="M24 5.5l4 4.5-4 4.5"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {wordmark && (
        <span className="font-display text-lg font-bold tracking-tight">
          <span className="text-accent">Addis</span>
          <span className="text-ink">Dispatch</span>
        </span>
      )}
    </span>
  );
}
