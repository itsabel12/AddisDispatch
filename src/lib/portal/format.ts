export function fmtMoney(n: number | null | undefined, withCents = false): string {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: withCents ? 2 : 0,
    maximumFractionDigits: withCents ? 2 : 0,
  }).format(n);
}

/** Date-only columns (YYYY-MM-DD) — pin to local midnight to avoid TZ drift. */
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  const iso = d.length === 10 ? `${d}T00:00:00` : d;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function lane(
  oc: string | null,
  os: string | null,
  dc: string | null,
  ds: string | null,
): string {
  const from = [oc, os].filter(Boolean).join(", ");
  const to = [dc, ds].filter(Boolean).join(", ");
  return `${from || "—"} → ${to || "—"}`;
}

/** Absolute date + time, e.g. "Jun 27, 2026, 2:14 PM". */
export function fmtDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Compact relative time, e.g. "2h ago", "3d ago". */
export function timeAgo(d: string | null | undefined): string {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 30) return `${days}d ago`;
  const mo = Math.round(days / 30);
  return `${mo}mo ago`;
}

/** Whole days from today until `d` (negative = past). Null when no date. */
export function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  const target = new Date(`${d.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}
