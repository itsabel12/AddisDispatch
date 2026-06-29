import Link from "next/link";
import type { Load } from "@/lib/portal/types";
import { fmtMoney, fmtDate, lane } from "@/lib/portal/format";
import { LoadBadge } from "./Badge";

export default function LoadsTable({ loads }: { loads: Load[] }) {
  if (loads.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
        No loads to show yet. Your dispatcher will book loads here.
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-portalBorder bg-bgSurface md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-portalBorder text-xs uppercase tracking-wider text-textMuted">
              <th className="px-5 py-3 font-medium">Ref #</th>
              <th className="px-5 py-3 font-medium">Lane</th>
              <th className="px-5 py-3 font-medium">Pickup</th>
              <th className="px-5 py-3 font-medium">Delivery</th>
              <th className="px-5 py-3 text-right font-medium">Rate</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-portalBorder">
            {loads.map((l) => (
              <tr key={l.id} className="group transition-colors hover:bg-bgElevated">
                <td className="px-5 py-3">
                  <Link href={`/portal/loads/${l.id}`} className="font-semibold text-textPrimary group-hover:text-gold">
                    {l.ref_number || "—"}
                  </Link>
                </td>
                <td className="px-5 py-3 text-textMuted">{lane(l.origin_city, l.origin_state, l.dest_city, l.dest_state)}</td>
                <td className="px-5 py-3 text-textMuted">{fmtDate(l.pickup_date)}</td>
                <td className="px-5 py-3 text-textMuted">{fmtDate(l.delivery_date)}</td>
                <td className="px-5 py-3 text-right font-semibold text-textPrimary">{fmtMoney(l.rate)}</td>
                <td className="px-5 py-3"><LoadBadge status={l.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {loads.map((l) => (
          <Link
            key={l.id}
            href={`/portal/loads/${l.id}`}
            className="block rounded-2xl border border-portalBorder bg-bgSurface p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-textPrimary">{l.ref_number || "—"}</span>
              <LoadBadge status={l.status} />
            </div>
            <div className="mt-2 text-sm text-textMuted">{lane(l.origin_city, l.origin_state, l.dest_city, l.dest_state)}</div>
            <div className="mt-3 flex items-center justify-between text-xs text-textMuted">
              <span>{fmtDate(l.pickup_date)} → {fmtDate(l.delivery_date)}</span>
              <span className="text-base font-semibold text-textPrimary">{fmtMoney(l.rate)}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
