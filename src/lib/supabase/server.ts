// Enforces at BUILD time what the doc comment below only asks for: importing
// this module from a client component fails the build instead of silently
// shipping a bundle that reads SUPABASE_SECRET_KEY.
import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for the lead API routes.
 *
 * Prefers the SECRET key (SUPABASE_SECRET_KEY) so inserts run as the service
 * role — which lets the anon INSERT grant be revoked on the live tables (the
 * only remaining direct-write path), making the Turnstile-gated API route the
 * sole way to create a lead. If the secret key is not set (e.g. local dev), it
 * falls back to the publishable key, which still works under the anon INSERT
 * policy. NEVER import this from a client component.
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const key = secret || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured (missing URL or key)");
  }

  // Make the fallback audible. Once `insert` is revoked from `anon`, falling
  // back to the publishable key means EVERY lead insert fails with a generic
  // 502 — and a missing/misspelled SUPABASE_SECRET_KEY would otherwise degrade
  // to exactly that, silently. This line is the difference between a two-minute
  // fix and an afternoon of guessing. Logs the fact, never the value.
  if (!secret && process.env.NODE_ENV === "production") {
    console.warn(
      "[supabase] SUPABASE_SECRET_KEY unset — falling back to the publishable key. " +
        "Lead inserts will fail if `insert` has been revoked from the anon role.",
    );
  }

  return createClient(url, key, { auth: { persistSession: false } });
}
