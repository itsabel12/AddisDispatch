import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fmtMoney, fmtDate } from "@/lib/portal/format";
import type { Settlement } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { SettlementBadge } from "@/components/portal/Badge";

export const metadata: Metadata = { title: "Settlements — AddisDispatch Portal" };

type SettlementRow = Settlement & { loads: { ref_number: string | null } | null };

export default async function SettlementsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settlements")
    .select("*, loads(ref_number)")
    .order("paid_at", { ascending: false, nullsFirst: true });

  const rows = (data ?? []) as SettlementRow[];

  const totalPaid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + (r.net ?? 0), 0);
  const totalPending = rows.filter((r) => r.status === "pending").reduce((s, r) => s + (r.net ?? 0), 0);
  const totalFees = rows.reduce((s, r) => s + (r.dispatch_fee ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Settlements"
        subtitle="Your gross, our dispatch fee, and your net — per load."
        action={
          rows.length > 0 ? (
            <a
              href="/portal/statements/weekly"
              className="rounded-full border border-portalBorder px-4 py-2 text-sm font-medium text-textMuted transition-colors hover:border-gold/50 hover:text-gold"
            >
              ↓ Weekly statement (PDF)
            </a>
          ) : undefined
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-leafGreen/30 bg-leafGreen/10 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-textMuted">Total Paid (Net)</div>
          <div className="mt-2 text-2xl font-bold text-[#7DD166]">{fmtMoney(totalPaid, true)}</div>
        </div>
        <div className="rounded-2xl border border-gold/30 bg-gold/12 p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-textMuted">Total Pending (Net)</div>
          <div className="mt-2 text-2xl font-bold text-gold">{fmtMoney(totalPending, true)}</div>
        </div>
        <div className="rounded-2xl border border-portalBorder bg-bgSurface p-5">
          <div className="text-xs font-medium uppercase tracking-wider text-textMuted">Total Dispatch Fees</div>
          <div className="mt-2 text-2xl font-bold text-textPrimary">{fmtMoney(totalFees, true)}</div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
          No settlements yet.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl border border-portalBorder bg-bgSurface md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-portalBorder text-xs uppercase tracking-wider text-textMuted">
                  <th className="px-5 py-3 font-medium">Load</th>
                  <th className="px-5 py-3 text-right font-medium">Gross</th>
                  <th className="px-5 py-3 text-right font-medium text-gold">Dispatch Fee</th>
                  <th className="px-5 py-3 text-right font-medium">Net</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Paid</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-portalBorder">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors hover:bg-bgElevated">
                    <td className="px-5 py-3 font-semibold text-textPrimary">{r.loads?.ref_number || "—"}</td>
                    <td className="px-5 py-3 text-right text-textMuted">{fmtMoney(r.gross, true)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gold">−{fmtMoney(r.dispatch_fee, true)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-textPrimary">{fmtMoney(r.net, true)}</td>
                    <td className="px-5 py-3"><SettlementBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-textMuted">{fmtDate(r.paid_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <a href={`/portal/statements/load/${r.id}`} className="text-xs font-medium text-textMuted hover:text-gold" title="Download statement">
                        ↓ PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl border border-portalBorder bg-bgSurface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-textPrimary">{r.loads?.ref_number || "—"}</span>
                  <SettlementBadge status={r.status} />
                </div>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-textMuted">Gross</dt><dd className="text-textPrimary">{fmtMoney(r.gross, true)}</dd></div>
                  <div className="flex justify-between"><dt className="text-textMuted">Dispatch fee</dt><dd className="font-semibold text-gold">−{fmtMoney(r.dispatch_fee, true)}</dd></div>
                  <div className="flex justify-between border-t border-portalBorder pt-1.5"><dt className="font-medium text-textPrimary">Net</dt><dd className="font-bold text-textPrimary">{fmtMoney(r.net, true)}</dd></div>
                </dl>
                <a href={`/portal/statements/load/${r.id}`} className="mt-3 inline-block text-xs font-medium text-gold hover:underline">
                  ↓ Download statement (PDF)
                </a>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
