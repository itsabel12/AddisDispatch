import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * RadialGauge — an SVG donut meter (the inspiration's performance gauges).
 * A soft track ring with a colored progress arc, the percentage centered, and a
 * caption beneath. Animates the arc via a CSS transition on the dash offset.
 */
export function RadialGauge({
  value,
  label,
  color = "var(--color-accent)",
  size = 92,
  stroke = 9,
  className,
}: {
  value: number; // 0–100
  label: string;
  color?: string;
  size?: number;
  stroke?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-heading text-lg font-semibold tabular-nums">
          {Math.round(clamped)}%
        </span>
      </div>
      <span className="text-center text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
