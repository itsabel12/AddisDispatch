import type { Load } from "@/lib/api";

/** Format a number as USD, tolerating null. */
export function money(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format an ISO date string as a short local date, tolerating null. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Origin → destination string for a load. */
export function lane(load: Pick<Load, "origin_city" | "origin_state" | "dest_city" | "dest_state">): string {
  return `${load.origin_city}, ${load.origin_state} → ${load.dest_city}, ${load.dest_state}`;
}
