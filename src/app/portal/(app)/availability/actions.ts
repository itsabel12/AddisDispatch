"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAudit } from "@/lib/portal/audit";
import type { AvailabilityStatus } from "@/lib/portal/types";

export async function saveAvailability(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("carrier_id").eq("id", user.id).single();
  if (!profile?.carrier_id) return;

  const availability_status = String(formData.get("availability_status") || "available") as AvailabilityStatus;
  const current_location = String(formData.get("current_location") || "").trim() || null;
  const home_base = String(formData.get("home_base") || "").trim() || null;
  const desired_home_time = String(formData.get("desired_home_time") || "").trim() || null;
  const preferred_lanes = String(formData.get("preferred_lanes") || "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await supabase.from("carrier_preferences").upsert(
    {
      carrier_id: profile.carrier_id,
      availability_status,
      current_location,
      home_base,
      desired_home_time,
      preferred_lanes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "carrier_id" },
  );

  await writeAudit({
    action: "preferences_updated",
    entityType: "carrier",
    metadata: { availability_status },
  });
  revalidatePath("/portal/availability");
}
