import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client (uses the public publishable key).
 * Safe to call from "use client" components — used here for anonymous
 * form submissions, gated by row-level-security insert policies.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
