import { createClient } from "@/lib/supabase/server";

type AuditInput = {
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

/**
 * Writes one audit_log row attributed to the current user + their carrier.
 * RLS (audit_insert) enforces carrier_id = own and actor_id = auth.uid(), so a
 * carrier can never forge an entry for another carrier. Call from server actions
 * after a successful state change.
 */
export async function writeAudit(input: AuditInput): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("carrier_id")
    .eq("id", user.id)
    .single();
  if (!profile?.carrier_id) return;

  await supabase.from("audit_log").insert({
    carrier_id: profile.carrier_id,
    actor_id: user.id,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
  });
}
