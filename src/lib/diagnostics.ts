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
  /** Which identifier `companyId` came from, or null when none was available. */
  companyIdSource: "QuickBooks Realm ID" | "Internal company ID" | null;
  lastIntuitTid: string;
  generatedAt: string;
};

/**
 * Build the diagnostics snapshot from the identity we have + cached tid.
 *
 * Company identifier precedence: the QuickBooks Realm ID is preferred (it's what
 * Intuit support keys off), then an internal company ID, otherwise
 * "Not available".
 */
export function collectDiagnostics(input: {
  userId?: string | null;
  realmId?: string | null;
  internalCompanyId?: string | null;
}): Diagnostics {
  const realmId = input.realmId?.trim() || null;
  const internalCompanyId = input.internalCompanyId?.trim() || null;
  const companyId = realmId ?? internalCompanyId;
  const last = getLastIntuitTid();
  return {
    appVersion: APP_VERSION || NOT_AVAILABLE,
    userId: input.userId || NOT_AVAILABLE,
    companyId: companyId ?? NOT_AVAILABLE,
    companyIdSource: realmId
      ? "QuickBooks Realm ID"
      : internalCompanyId
        ? "Internal company ID"
        : null,
    lastIntuitTid: last ? last.tid : NOT_AVAILABLE,
    generatedAt: new Date().toISOString(),
  };
}

/** Render diagnostics as a plain-text block for copy / email. */
export function formatDiagnostics(d: Diagnostics): string {
  const company = d.companyIdSource
    ? `${d.companyId} (${d.companyIdSource})`
    : d.companyId;
  return [
    "AddisDispatch — diagnostic information",
    `App version: ${d.appVersion}`,
    `User ID: ${d.userId}`,
    `Company ID: ${company}`,
    `Last QuickBooks intuit_tid: ${d.lastIntuitTid}`,
    `Generated: ${d.generatedAt}`,
  ].join("\n");
}
