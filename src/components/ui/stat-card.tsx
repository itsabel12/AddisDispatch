import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * StatCard — the KPI tile of the dashboard (label, big number, optional trend
 * delta and icon). Modeled on the inspiration's metric cards: a small uppercase
 * label, a large display number, and a colored trend chip beneath.
 */
export function StatCard({
  label,
  value,
  delta,
  hint,
  icon,
  href,
  accent = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: { value: string; direction: "up" | "down" | "flat" };
  hint?: string;
  icon?: React.ReactNode;
  href?: string;
  accent?: boolean;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="grid size-8 place-items-center rounded-lg bg-accent/10 text-accentDeep">
            {icon}
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-2 font-heading text-3xl font-semibold tracking-tight tabular-nums",
          accent ? "text-accentDeep" : "text-foreground",
        )}
      >
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-medium",
                delta.direction === "up" && "text-success",
                delta.direction === "down" && "text-danger",
                delta.direction === "flat" && "text-muted-foreground",
              )}
            >
              {delta.direction === "up" ? "↑" : delta.direction === "down" ? "↓" : "→"}
              {delta.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </>
  );

  const base = cn(
    "block rounded-2xl border border-border bg-card p-5 shadow-soft transition-all",
    href && "hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-card",
    className,
  );

  return href ? (
    <Link href={href} className={base}>
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}
