"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const NEXT_STATUS = ["in_transit", "delivered"] as const;

export async function advanceLoadStatus(formData: FormData) {
  const loadId = String(formData.get("loadId") || "");
  const next = String(formData.get("next") || "");
  if (!loadId || !NEXT_STATUS.includes(next as (typeof NEXT_STATUS)[number])) return;

  const supabase = await createClient();
  const patch: Record<string, unknown> = { status: next };
  if (next === "in_transit") patch.picked_up_at = new Date().toISOString();
  if (next === "delivered") patch.delivered_at = new Date().toISOString();

  // RLS scopes this to the carrier's own active loads; the status-change trigger
  // writes the audit row and notification.
  await supabase.from("loads").update(patch).eq("id", loadId);
  revalidatePath(`/portal/loads/${loadId}`);
}
