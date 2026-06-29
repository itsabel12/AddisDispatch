"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type ForgotState = { error?: string; sent?: boolean } | undefined;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestReset(_prev: ForgotState, formData: FormData): Promise<ForgotState> {
  const email = String(formData.get("email") || "").trim();
  if (!emailPattern.test(email)) return { error: "Enter a valid email address." };

  const supabase = await createClient();
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const origin = `${proto}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/portal/auth/callback?next=/portal/reset-password`,
  });

  // Unknown emails return success (no error) so we never reveal whether an
  // account exists. Only genuine failures surface a message.
  if (error) {
    const msg = (error.message ?? "").toLowerCase();
    if (error.status === 429 || msg.includes("rate")) {
      return { error: "Too many requests — please wait a few minutes and try again." };
    }
    if (msg.includes("invalid")) {
      return { error: "That email address doesn't look valid." };
    }
    return { error: "Couldn't send the reset email right now. Please try again." };
  }
  return { sent: true };
}
