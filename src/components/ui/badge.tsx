import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge / status pill — soft-tinted, rounded status indicator used across the
 * portal (load status, invoice status, payroll status, document status…).
 * One authoritative set of tones keeps colored states consistent everywhere.
 */
const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        accent: "border-accent/25 bg-accent/10 text-accentDeep",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-amber-500/25 bg-amber-500/10 text-amber-600",
        danger: "border-danger/25 bg-danger/10 text-danger",
        info: "border-info/25 bg-info/10 text-info",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

function Badge({
  className,
  tone,
  dot = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" aria-hidden />}
      {props.children}
    </span>
  );
}

// Map common domain statuses -> a tone, so every table/list agrees on color.
const STATUS_TONES: Record<string, VariantProps<typeof badgeVariants>["tone"]> = {
  // loads
  new: "neutral",
  booked: "info",
  in_transit: "accent",
  delivered: "success",
  issue: "danger",
  // invoices
  draft: "neutral",
  sent: "warning",
  viewed: "info",
  paid: "success",
  overdue: "danger",
  // payroll
  pending: "warning",
  approved: "info",
  needs_review: "danger",
  // documents / pod / email
  uploaded: "neutral",
  processing: "accent",
  extracted: "accent",
  failed: "danger",
  approved_doc: "success",
  rejected: "neutral",
  handled: "success",
  archived: "neutral",
};

function statusTone(status: string): VariantProps<typeof badgeVariants>["tone"] {
  return STATUS_TONES[status] ?? "neutral";
}

/** Convenience: a status pill that picks its tone from the status string. */
function StatusBadge({
  status,
  className,
  ...props
}: React.ComponentProps<"span"> & { status: string }) {
  return (
    <Badge tone={statusTone(status)} dot className={className} {...props}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export { Badge, StatusBadge, badgeVariants, statusTone };
