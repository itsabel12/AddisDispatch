/**
 * Diagnostic information for the Help / Support page.
 *
 * Collects the app version, the signed-in user id, the company id, and the most
 * recent QuickBooks `intuit_tid` (when one has been observed) into a copyable
 * block support can use to troubleshoot. The tid is captured best-effort by the
 * admin API client (lib/api.ts) whenever a backend response forwards Intuit's
 * `intuit_tid` header, and cached in localStorage so it survives navigation.
 */

import { APP_VERSION, APP_ENVIRONMENT } from "./support";

const TID_KEY = "qbo:lastIntuitTid";
const NOT_AVAILABLE = "Not available";

/**
 * Best-effort browser name + major version from the User-Agent, e.g.
 * "Chrome 142". Returns "Not available" during SSR (no navigator). Order
 * matters: Edge/Opera embed "Chrome" in their UA, so they're checked first.
 */
function detectBrowser(): string {
  if (typeof navigator === "undefined") return NOT_AVAILABLE;
  const ua = navigator.userAgent;
  const patterns: [string, RegExp][] = [
    ["Edge", /Edg(?:e|A|iOS)?\/(\d+)/],
    ["Opera", /OPR\/(\d+)/],
    ["Samsung Internet", /SamsungBrowser\/(\d+)/],
    ["Chrome", /Chrome\/(\d+)/],
    ["Firefox", /Firefox\/(\d+)/],
    ["Safari", /Version\/(\d+)[\d.]*\s+(?:Mobile\/\S+\s+)?Safari/],
  ];
  for (const [name, re] of patterns) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1]}`;
  }
  return ua.slice(0, 80) || NOT_AVAILABLE; // fallback: truncated raw UA
}

/** Persist the latest QuickBooks transaction id (no-op on the server). */
export function recordIntuitTid(tid: string | null | undefined): void {
  if (!tid || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      TID_KEY,
      JSON.stringify({ tid, at: new Date().toISOString() }),
    );
  } catch {
    // localStorage unavailable (private mode / quota) — diagnostics degrade to
    // "Not available"; never break the surrounding request.
  }
}

/** The last observed QuickBooks tid + when it was seen, or null. */
export function getLastIntuitTid(): { tid: string; at: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(TID_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { tid?: unknown; at?: unknown };
    return parsed?.tid
      ? { tid: String(parsed.tid), at: String(parsed.at ?? "") }
      : null;
  } catch {
    return null;
  }
}

export type Diagnostics = {
  appVersion: string;
  environment: string;
  quickbooksConnected: boolean;
  realmId: string;
  lastIntuitTid: string;
  userId: string;
  companyId: string;
  browser: string;
  generatedAt: string;
};

/**
 * Build the diagnostics snapshot. Every field is non-sensitive — build metadata,
 * opaque identifiers (Clerk user id, QuickBooks realm / internal company id), a
 * trace id, and client context. No tokens, secrets, names, or emails.
 */
export function collectDiagnostics(input: {
  userId?: string | null;
  realmId?: string | null;
  internalCompanyId?: string | null;
  quickbooksConnected?: boolean;
}): Diagnostics {
  const last = getLastIntuitTid();
  return {
    appVersion: APP_VERSION || NOT_AVAILABLE,
    environment: APP_ENVIRONMENT || NOT_AVAILABLE,
    quickbooksConnected: Boolean(input.quickbooksConnected),
    realmId: input.realmId?.trim() || NOT_AVAILABLE,
    lastIntuitTid: last ? last.tid : NOT_AVAILABLE,
    userId: input.userId?.trim() || NOT_AVAILABLE,
    companyId: input.internalCompanyId?.trim() || NOT_AVAILABLE,
    browser: detectBrowser(),
    generatedAt: new Date().toISOString(),
  };
}

/** Render diagnostics as a plain-text block for copy / email. */
export function formatDiagnostics(d: Diagnostics): string {
  return [
    `App Version: ${d.appVersion}`,
    `Environment: ${d.environment}`,
    `QuickBooks Connected: ${d.quickbooksConnected ? "Yes" : "No"}`,
    `Realm ID: ${d.realmId}`,
    `Last intuit_tid: ${d.lastIntuitTid}`,
    `User ID: ${d.userId}`,
    `Company ID: ${d.companyId}`,
    `Timestamp: ${d.generatedAt}`,
    `Browser: ${d.browser}`,
  ].join("\n");
}
