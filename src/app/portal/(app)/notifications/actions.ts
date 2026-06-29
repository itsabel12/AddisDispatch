"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markAllRead() {
  const supabase = await createClient();
  // RLS scopes this to the carrier's own notifications.
  await supabase.from("notifications").update({ read: true }).eq("read", false);
  revalidatePath("/portal/notifications");
}
