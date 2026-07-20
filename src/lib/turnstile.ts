/**
 * Cloudflare Turnstile server-side verification.
 *
 * The public forms render a Turnstile widget (see TurnstileWidget.tsx) which
 * yields a one-time token. The lead API routes call verifyTurnstile() with that
 * token before writing anything, so a scripted client without a solved challenge
 * is rejected.
 *
 * Graceful degradation: if TURNSTILE_SECRET_KEY is unset we SKIP verification
 * (and warn), matching how the rest of the app treats unconfigured integrations.
 * This is an anti-spam control on business-critical lead capture, so a missing
 * key must never drop a real lead — protection simply engages once the key is
 * set. When the key IS set, a missing/invalid token is rejected.
 */

// Build-time guarantee that this never reaches the browser: importing it from a
// client component fails the build rather than shipping TURNSTILE_SECRET_KEY.
import "server-only";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; reason: string };

export async function verifyTurnstile(
  token: string | undefined | null,
  remoteip?: string | null,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    // Unconfigured: allow, but make it visible so it's noticed in any env.
    console.warn("[turnstile] TURNSTILE_SECRET_KEY unset — skipping verification");
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, reason: "missing-token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set("remoteip", remoteip);

  let data: { success?: boolean; ["error-codes"]?: string[] };
  try {
    const res = await fetch(SITEVERIFY_URL, { method: "POST", body });
    data = await res.json();
  } catch {
    return { ok: false, reason: "verify-request-failed" };
  }

  if (!data.success) {
    return { ok: false, reason: (data["error-codes"] || ["failed"]).join(",") };
  }
  return { ok: true };
}
