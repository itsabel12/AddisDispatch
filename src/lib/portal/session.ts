import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Carrier, Profile } from "./types";

export type PortalContext = {
  user: { id: string; email: string | null };
  profile: Profile;
  carrier: Carrier;
};

/**
 * Resolves the authenticated carrier context for a portal page.
 *
 * - No session → redirect to login.
 * - Authenticated but no profile row → redirect to login (orphaned auth user).
 *
 * Every value returned here is fetched under the user's session, so RLS already
 * guarantees the profile/carrier belong to this user.
 */
export async function getPortalContext(): Promise<PortalContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, carrier_id, full_name, phone, role")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/portal/login");

  const { data: carrier } = await supabase
    .from("carriers")
    .select("id, company_name, mc_number, dot_number, status, created_at")
    .eq("id", profile.carrier_id)
    .single<Carrier>();

  if (!carrier) redirect("/portal/login");

  return {
    user: { id: user.id, email: user.email ?? null },
    profile,
    carrier,
  };
}
