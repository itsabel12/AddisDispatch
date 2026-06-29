"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { EquipmentType } from "@/lib/portal/types";

async function carrierIdFor(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("carrier_id").eq("id", user.id).single();
  return { userId: user.id, carrierId: data?.carrier_id as string | undefined };
}

export async function updateCompany(formData: FormData) {
  const supabase = await createClient();
  const ctx = await carrierIdFor(supabase);
  if (!ctx?.carrierId) return;

  await supabase
    .from("carriers")
    .update({
      company_name: String(formData.get("company_name") || "").trim() || "Carrier",
      mc_number: String(formData.get("mc_number") || "").trim() || null,
      dot_number: String(formData.get("dot_number") || "").trim() || null,
    })
    .eq("id", ctx.carrierId);

  revalidatePath("/portal/profile");
}

export async function updateContact(formData: FormData) {
  const supabase = await createClient();
  const ctx = await carrierIdFor(supabase);
  if (!ctx) return;

  await supabase
    .from("profiles")
    .update({
      full_name: String(formData.get("full_name") || "").trim() || null,
      phone: String(formData.get("phone") || "").trim() || null,
    })
    .eq("id", ctx.userId);

  revalidatePath("/portal/profile");
}

export async function addEquipment(formData: FormData) {
  const supabase = await createClient();
  const ctx = await carrierIdFor(supabase);
  if (!ctx?.carrierId) return;

  const type = String(formData.get("type") || "") as EquipmentType;
  const unit_number = String(formData.get("unit_number") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;
  if (!type) return;

  await supabase.from("equipment").insert({ carrier_id: ctx.carrierId, type, unit_number, notes });
  revalidatePath("/portal/profile");
}

export async function removeEquipment(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  if (!id) return;
  // RLS ensures only the owning carrier's row can be deleted.
  await supabase.from("equipment").delete().eq("id", id);
  revalidatePath("/portal/profile");
}
