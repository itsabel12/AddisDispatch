import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ArrowUp, ArrowRight } from "@/components/icons";

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
          <span
            className={cn(
              "grid size-8 place-items-center rounded-lg",
              accent ? "bg-accent/15 text-accent" : "bg-secondary text-muted-foreground",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <div
        className={cn(
          "mt-2 font-heading text-2xl font-semibold tracking-tight tabular-nums",
          accent ? "text-accent" : "text-foreground",
        )}
      >
        {value}
      </div>
      {(delta || hint) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {delta && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold",
                delta.direction === "up" && "border-success/30 bg-success/15 text-success",
                delta.direction === "down" && "border-danger/30 bg-danger/15 text-danger",
                delta.direction === "flat" && "border-border bg-secondary text-muted-foreground",
              )}
            >
              {delta.direction === "up" ? (
                <ArrowUp size={12} />
              ) : delta.direction === "down" ? (
                <ArrowUp size={12} className="rotate-180" />
              ) : (
                <ArrowRight size={12} />
              )}
              {delta.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </>
  );

  const base = cn(
    "block rounded-lg border border-border bg-card p-5 transition-all",
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
