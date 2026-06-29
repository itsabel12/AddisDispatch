import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fmtDate, daysUntil } from "@/lib/portal/format";
import { COMPLIANCE_LABELS, type ComplianceItem, type ComplianceType } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { Badge } from "@/components/portal/Badge";
import { addComplianceItem, removeComplianceItem } from "./actions";

export const metadata: Metadata = { title: "Compliance — AddisDispatch Portal" };

const TYPES = Object.keys(COMPLIANCE_LABELS) as ComplianceType[];
const inputClass =
  "w-full rounded-xl border border-portalBorder bg-bgElevated px-3 py-2.5 text-sm text-textPrimary placeholder:text-textMuted/50 focus:border-gold/60 focus:outline-none";

function urgency(item: ComplianceItem): { tone: "green" | "gold" | "red"; label: string } {
  const n = daysUntil(item.expires_at);
  if (item.status === "expired" || (n != null && n < 0)) return { tone: "red", label: "Expired" };
  if (item.status === "expiring" || (n != null && n <= 14)) {
    return { tone: "gold", label: n != null ? `Expires in ${n}d` : "Expiring" };
  }
  return { tone: "green", label: "Valid" };
}

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("compliance_items")
    .select("*")
    .order("expires_at", { ascending: true, nullsFirst: false });
  const items = (data ?? []) as ComplianceItem[];

  const expiredCount = items.filter((i) => urgency(i).tone === "red").length;
  const expiringCount = items.filter((i) => urgency(i).tone === "gold").length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Compliance"
        subtitle="Track CDL, medical card, inspections, IFTA, insurance, and registration."
      />

      {(expiredCount > 0 || expiringCount > 0) && (
        <div className="mb-6 flex flex-wrap gap-3 text-sm">
          {expiredCount > 0 && (
            <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 font-medium text-red-400">
              {expiredCount} expired
            </span>
          )}
          {expiringCount > 0 && (
            <span className="rounded-full border border-gold/30 bg-gold/12 px-3 py-1 font-medium text-gold">
              {expiringCount} expiring soon
            </span>
          )}
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
          No compliance items yet. Add your CDL, insurance, and inspection dates below.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const u = urgency(item);
            return (
              <li
                key={item.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-bgSurface p-4 ${
                  u.tone === "red" ? "border-red-500/40" : u.tone === "gold" ? "border-gold/40" : "border-portalBorder"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-textPrimary">{COMPLIANCE_LABELS[item.type]}</span>
                    <Badge tone={u.tone}>{u.label}</Badge>
                  </div>
                  <div className="mt-1 text-xs font-light text-textMuted">
                    {item.holder === "driver" ? "Driver" : "Truck"}
                    {item.reference_id ? ` · ${item.reference_id}` : ""}
                    {item.expires_at ? ` · Expires ${fmtDate(item.expires_at)}` : ""}
                  </div>
                </div>
                <form action={removeComplianceItem}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" className="text-xs font-medium text-textMuted transition-colors hover:text-red-400">
                    Remove
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add */}
      <form
        action={addComplianceItem}
        className="mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-portalBorder bg-bgSurface p-5 sm:grid-cols-4"
      >
        <div className="col-span-2 sm:col-span-1">
          <label htmlFor="type" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted">Type</label>
          <select id="type" name="type" className={inputClass} defaultValue="cdl">
            {TYPES.map((t) => (<option key={t} value={t}>{COMPLIANCE_LABELS[t]}</option>))}
          </select>
        </div>
        <div>
          <label htmlFor="holder" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted">Holder</label>
          <select id="holder" name="holder" className={inputClass} defaultValue="driver">
            <option value="driver">Driver</option>
            <option value="truck">Truck</option>
          </select>
        </div>
        <div>
          <label htmlFor="reference_id" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted">Reference</label>
          <input id="reference_id" name="reference_id" placeholder="Name / Unit" className={inputClass} />
        </div>
        <div>
          <label htmlFor="expires_at" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-textMuted">Expires</label>
          <input id="expires_at" name="expires_at" type="date" className={inputClass} />
        </div>
        <div className="col-span-2 flex justify-end sm:col-span-4">
          <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50">
            Add item
          </button>
        </div>
      </form>
    </div>
  );
}
