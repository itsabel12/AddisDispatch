import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Shared handler for the public lead-capture API routes.
 *
 * Each form POSTs `{ turnstileToken, ...columns }`. We verify the Turnstile
 * challenge, keep only the whitelisted columns for the target table (so the
 * client can't set arbitrary fields like `status`), check the required ones are
 * present, then insert server-side. This replaces the previous direct
 * browser→Supabase insert, moving the write behind a bot check.
 */
export type LeadSpec = {
  table: string;
  /** Columns accepted from the client, in the shape they're stored. */
  allowed: readonly string[];
  /** Subset of `allowed` that must be non-empty. */
  required: readonly string[];
};

function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function handleLead(req: NextRequest, spec: LeadSpec): Promise<NextResponse> {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof payload.turnstileToken === "string" ? payload.turnstileToken : undefined;
  const verdict = await verifyTurnstile(token, clientIp(req));
  if (!verdict.ok) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }

  // Whitelist columns and validate required fields server-side.
  const row: Record<string, unknown> = {};
  for (const col of spec.allowed) {
    if (col in payload) row[col] = payload[col];
  }
  for (const col of spec.required) {
    const v = row[col];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
  }

  try {
    const supabase = createServerClient();
    const { error } = await supabase.from(spec.table).insert(row);
    if (error) {
      console.error(`[leads] insert into ${spec.table} failed:`, error.message);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 502 });
    }
  } catch (e) {
    console.error(`[leads] ${spec.table} handler error:`, e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
