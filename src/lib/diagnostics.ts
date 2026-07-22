/**
 * Diagnostic information for the Help / Support page.
 *
 * Collects the app version, the signed-in user id, the company id, and the most
 * recent QuickBooks `intuit_tid` (when one has been observed) into a copyable
 * block support can use to troubleshoot. The tid is captured best-effort by the
 * admin API client (lib/api.ts) whenever a backend response forwards Intuit's
 * `intuit_tid` header, and cached in localStorage so it survives navigation.
 */

import { APP_VERSION } from "./support";

const TID_KEY = "qbo:lastIntuitTid";
const NOT_AVAILABLE = "Not available";

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
  userId: string;
  companyId: string;
  lastIntuitTid: string;
  generatedAt: string;
};

/** Build the diagnostics snapshot from the identity we have + cached tid. */
export function collectDiagnostics(input: {
  userId?: string | null;
  companyId?: string | null;
}): Diagnostics {
  const last = getLastIntuitTid();
  return {
    appVersion: APP_VERSION || NOT_AVAILABLE,
    userId: input.userId || NOT_AVAILABLE,
    companyId: input.companyId || NOT_AVAILABLE,
    lastIntuitTid: last ? last.tid : NOT_AVAILABLE,
    generatedAt: new Date().toISOString(),
  };
}

/** Render diagnostics as a plain-text block for copy / email. */
export function formatDiagnostics(d: Diagnostics): string {
  return [
    "AddisDispatch — diagnostic information",
    `App version: ${d.appVersion}`,
    `User ID: ${d.userId}`,
    `Company ID: ${d.companyId}`,
    `Last QuickBooks intuit_tid: ${d.lastIntuitTid}`,
    `Generated: ${d.generatedAt}`,
  ].join("\n");
}
