"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AGREEMENT_VERSION } from "@/lib/portal/constants";

/**
 * Click-to-sign fallback for the dispatch service agreement (used because
 * PandaDoc is not connected in this environment). Captures the legal minimum:
 * signer identity + intent + versioned document + timestamp + IP. The
 * agreement-signed DB trigger writes the audit row and notification.
 */
export async function signAgreement(formData: FormData) {
  const signer_name = String(formData.get("signer_name") || "").trim();
  const intent = formData.get("intent");
  if (!signer_name || !intent) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("carrier_id").eq("id", user.id).single();
  if (!profile?.carrier_id) return;

  // Don't double-sign.
  const { data: existing } = await supabase
    .from("agreements")
    .select("id")
    .eq("carrier_id", profile.carrier_id)
    .eq("status", "signed")
    .maybeSingle();

  if (!existing) {
    const h = await headers();
    const ip =
      (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "").trim() || null;

    await supabase.from("agreements").insert({
      carrier_id: profile.carrier_id,
      type: "dispatch_service",
      version: AGREEMENT_VERSION,
      status: "signed",
      signer_name,
      signed_at: new Date().toISOString(),
      ip_address: ip,
    });
  }

  // Flip to active if docs are also complete.
  await supabase.rpc("maybe_activate_carrier");
  revalidatePath("/portal/onboarding");
}
