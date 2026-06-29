import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fmtDateTime, timeAgo } from "@/lib/portal/format";
import { AUDIT_ACTION_LABELS, type AuditLog } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";

export const metadata: Metadata = { title: "Activity — AddisDispatch Portal" };

function describe(row: AuditLog): string {
  const m = row.metadata || {};
  switch (row.action) {
    case "load_booked":
      return `Load ${m.ref_number ?? ""} was booked`.trim();
    case "load_status_changed":
      return `Load ${m.ref_number ?? ""} marked ${String(m.status ?? "").replace("_", " ")}`.trim();
    case "pod_uploaded":
      return `POD uploaded for load ${m.ref_number ?? ""}`.trim();
    case "document_uploaded":
      return `Document uploaded${m.type ? ` (${m.type})` : ""}`;
    case "settlement_paid":
      return `Settlement paid`;
    case "agreement_signed":
      return `Dispatch agreement signed${m.version ? ` (v${m.version})` : ""}`;
    case "carrier_activated":
      return "Account activated";
    case "preferences_updated":
      return "Availability / preferences updated";
    case "profile_updated":
      return "Profile updated";
    case "compliance_updated":
      return "Compliance item updated";
    default:
      return AUDIT_ACTION_LABELS[row.action] ?? row.action;
  }
}

export default async function ActivityPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as AuditLog[];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Activity" subtitle="A complete record of changes to your account — your dispute defense." />

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
          No activity recorded yet.
        </div>
      ) : (
        <ol className="relative space-y-4 border-l border-portalBorder pl-6">
          {rows.map((row) => (
            <li key={row.id} className="relative">
              <span className="absolute -left-[1.6rem] top-1.5 h-2 w-2 rounded-full bg-gold" />
              <div className="rounded-2xl border border-portalBorder bg-bgSurface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-textPrimary">{describe(row)}</span>
                  <span className="text-xs font-light text-textMuted" title={fmtDateTime(row.created_at)}>
                    {timeAgo(row.created_at)}
                  </span>
                </div>
                <div className="mt-1 text-xs font-light text-textMuted">
                  {AUDIT_ACTION_LABELS[row.action] ?? row.action} · {fmtDateTime(row.created_at)}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
