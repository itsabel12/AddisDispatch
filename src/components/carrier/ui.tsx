import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * StatTile — the ShipMate-style KPI card used across the carrier portal: an
 * accent-tinted icon chip, a label, and a large value. Built on the same tokens
 * as the rest of the design system so it adapts to light/dark automatically.
 */
export function StatTile({
  icon,
  label,
  value,
  hint,
  loading,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      <span className="inline-grid size-10 place-items-center rounded-xl bg-accent/10 text-accentDeep">
        {icon}
      </span>
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">
        {loading ? <span className="text-muted-foreground">—</span> : value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * EmptyState — consistent empty-content block for tables/lists across the portal.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {icon && (
        <span className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {icon}
        </span>
      )}
      <p className="text-sm font-medium text-foreground">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

/** A compact accent-tinted icon chip (reused in card headers, etc.). */
export function IconChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid size-9 place-items-center rounded-xl bg-accent/10 text-accentDeep",
        className,
      )}
    >
      {children}
    </span>
  );
}
