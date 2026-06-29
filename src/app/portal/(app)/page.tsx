import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getPortalContext } from "@/lib/portal/session";
import { fmtMoney, daysUntil } from "@/lib/portal/format";
import { DOC_LABELS, COMPLIANCE_LABELS, type Load, type DocumentRow, type ComplianceItem } from "@/lib/portal/types";
import KpiCard from "@/components/portal/KpiCard";
import PageHeader from "@/components/portal/PageHeader";
import LoadsTable from "@/components/portal/LoadsTable";

export default async function DashboardPage() {
  const { profile } = await getPortalContext();
  const supabase = await createClient();

  const [{ data: loadsData }, { data: docsData }, { data: complianceData }] = await Promise.all([
    supabase.from("loads").select("*").order("pickup_date", { ascending: false }),
    supabase.from("documents").select("*"),
    supabase.from("compliance_items").select("*"),
  ]);

  const loads = (loadsData ?? []) as Load[];
  const docs = (docsData ?? []) as DocumentRow[];
  const compliance = (complianceData ?? []) as ComplianceItem[];

  // Current week (Mon–Sun)
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  const inWeek = (d: string | null) => {
    if (!d) return false;
    const x = new Date(`${d.slice(0, 10)}T00:00:00`);
    return x >= weekStart && x < weekEnd;
  };

  const activeLoads = loads.filter((l) => l.status === "booked" || l.status === "in_transit");
  const weekLoads = loads.filter((l) => inWeek(l.pickup_date));
  const milesThisWeek = weekLoads.reduce((s, l) => s + (l.miles ?? 0), 0);
  const grossThisWeek = weekLoads.reduce((s, l) => s + (l.rate ?? 0), 0);
  const pendingDocs = docs.filter((d) => d.status === "pending").length;

  // Expiry alert: expired, or expiring within 14 days
  const flagged = docs
    .filter((d) => {
      if (d.status === "expired") return true;
      const n = daysUntil(d.expires_at);
      return n != null && n >= 0 && n <= 14;
    })
    .sort((a, b) => (daysUntil(a.expires_at) ?? 0) - (daysUntil(b.expires_at) ?? 0));

  // Compliance items expired or expiring within 14 days
  const complianceFlagged = compliance
    .filter((c) => {
      if (c.status === "expired") return true;
      const n = daysUntil(c.expires_at);
      return n != null && n >= 0 && n <= 14;
    })
    .sort((a, b) => (daysUntil(a.expires_at) ?? 0) - (daysUntil(b.expires_at) ?? 0));

  const firstName = profile.full_name?.split(" ")[0] || "there";

  return (
    <div>
      <PageHeader title={`Welcome back, ${firstName}`} subtitle="Here's your operation at a glance." />

      {flagged.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/12 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none">⚠️</span>
            <div className="text-sm">
              <p className="font-semibold text-gold">Action needed on documents</p>
              <ul className="mt-1.5 space-y-1 text-textPrimary/90">
                {flagged.map((d) => {
                  const n = daysUntil(d.expires_at);
                  const msg =
                    d.status === "expired" || (n != null && n < 0)
                      ? "has expired"
                      : n === 0
                        ? "expires today"
                        : `expires in ${n} day${n === 1 ? "" : "s"}`;
                  return (
                    <li key={d.id} className="font-light">
                      Your <span className="font-medium">{DOC_LABELS[d.type]}</span> {msg}.
                    </li>
                  );
                })}
              </ul>
              <Link href="/portal/documents" className="mt-2 inline-block text-sm font-medium text-gold hover:underline">
                Manage documents →
              </Link>
            </div>
          </div>
        </div>
      )}

      {complianceFlagged.length > 0 && (
        <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/12 p-4">
          <div className="flex items-start gap-3">
            <span className="text-lg leading-none">🛡️</span>
            <div className="text-sm">
              <p className="font-semibold text-gold">Compliance needs attention</p>
              <ul className="mt-1.5 space-y-1 text-textPrimary/90">
                {complianceFlagged.map((c) => {
                  const n = daysUntil(c.expires_at);
                  const msg =
                    c.status === "expired" || (n != null && n < 0)
                      ? "has expired"
                      : n === 0
                        ? "expires today"
                        : `expires in ${n} day${n === 1 ? "" : "s"}`;
                  return (
                    <li key={c.id} className="font-light">
                      Your <span className="font-medium">{COMPLIANCE_LABELS[c.type]}</span> {msg}.
                    </li>
                  );
                })}
              </ul>
              <Link href="/portal/compliance" className="mt-2 inline-block text-sm font-medium text-gold hover:underline">
                View compliance →
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Active Loads" value={String(activeLoads.length)} sub="Booked or in transit" accent />
        <KpiCard label="Miles This Week" value={milesThisWeek.toLocaleString()} sub="By pickup date" />
        <KpiCard label="Gross This Week" value={fmtMoney(grossThisWeek)} sub="Booked rate" accent />
        <KpiCard label="Pending Documents" value={String(pendingDocs)} sub="Awaiting verification" />
      </div>

      <div className="mt-8 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-textPrimary">Recent Loads</h2>
        <Link href="/portal/loads" className="text-sm font-medium text-gold hover:underline">
          View all →
        </Link>
      </div>
      <LoadsTable loads={loads.slice(0, 5)} />
    </div>
  );
}
