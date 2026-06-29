"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/portal/audit";
import type { ComplianceType } from "@/lib/portal/types";

function statusFor(expires: string | null): "valid" | "expiring" | "expired" {
  if (!expires) return "valid";
  const days = Math.round(
    (new Date(`${expires}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000,
  );
  if (days < 0) return "expired";
  if (days <= 14) return "expiring";
  return "valid";
}

export async function addComplianceItem(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("carrier_id").eq("id", user.id).single();
  if (!profile?.carrier_id) return;

  const type = String(formData.get("type") || "") as ComplianceType;
  const holder = String(formData.get("holder") || "driver");
  const reference_id = String(formData.get("reference_id") || "").trim() || null;
  const expires_at = String(formData.get("expires_at") || "").trim() || null;
  if (!type || (holder !== "driver" && holder !== "truck")) return;

  await supabase.from("compliance_items").insert({
    carrier_id: profile.carrier_id,
    type,
    holder,
    reference_id,
    expires_at,
    status: statusFor(expires_at),
  });
  await writeAudit({ action: "compliance_updated", entityType: "compliance", metadata: { type, op: "add" } });
  revalidatePath("/portal/compliance");
}

export async function removeComplianceItem(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await supabase.from("compliance_items").delete().eq("id", id);
  await writeAudit({ action: "compliance_updated", entityType: "compliance", entityId: id, metadata: { op: "remove" } });
  revalidatePath("/portal/compliance");
}
