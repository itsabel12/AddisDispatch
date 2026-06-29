import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fmtMoney, fmtDate, lane } from "@/lib/portal/format";
import { DOC_LABELS, type Load, type DocumentRow, type Settlement } from "@/lib/portal/types";
import { LoadBadge, DocBadge, SettlementBadge, Badge } from "@/components/portal/Badge";
import DocumentUpload from "@/components/portal/DocumentUpload";
import { advanceLoadStatus } from "./actions";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-textMuted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-textPrimary">{value}</dd>
    </div>
  );
}

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // RLS guarantees this returns a row only if it belongs to the carrier.
  const { data: load } = await supabase.from("loads").select("*").eq("id", id).maybeSingle<Load>();
  if (!load) notFound();

  const [{ data: docsData }, { data: settlement }] = await Promise.all([
    supabase.from("documents").select("*").eq("load_id", id),
    supabase.from("settlements").select("*").eq("load_id", id).maybeSingle<Settlement>(),
  ]);
  const docs = (docsData ?? []) as DocumentRow[];
  const hasPod = docs.some((d) => d.type === "pod");

  const rpm = load.rate && load.miles ? load.rate / load.miles : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/portal/loads" className="text-sm font-medium text-textMuted hover:text-gold">
        ← Back to loads
      </Link>

      <div className="mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">
          {load.ref_number || "Load"}
        </h1>
        <LoadBadge status={load.status} />
      </div>

      <div className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
          <div className="col-span-2 sm:col-span-3">
            <Field label="Lane" value={lane(load.origin_city, load.origin_state, load.dest_city, load.dest_state)} />
          </div>
          <Field label="Broker" value={load.broker_name || "—"} />
          <Field label="Pickup" value={fmtDate(load.pickup_date)} />
          <Field label="Delivery" value={fmtDate(load.delivery_date)} />
          <Field label="Rate" value={fmtMoney(load.rate)} />
          <Field label="Miles" value={load.miles?.toLocaleString() ?? "—"} />
          <Field label="RPM" value={rpm ? `$${rpm.toFixed(2)}` : "—"} />
        </dl>
      </div>

      {/* Carrier load actions */}
      {load.status !== "cancelled" && (
        <div className="mt-6 rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-textMuted">Load actions</h2>
            {load.ready_to_invoice && <Badge tone="green">Ready to invoice</Badge>}
          </div>

          <div className="mt-4">
            {load.status === "booked" && (
              <form action={advanceLoadStatus}>
                <input type="hidden" name="loadId" value={load.id} />
                <input type="hidden" name="next" value="in_transit" />
                <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50">
                  Mark Picked Up
                </button>
              </form>
            )}

            {load.status === "in_transit" && (
              <form action={advanceLoadStatus}>
                <input type="hidden" name="loadId" value={load.id} />
                <input type="hidden" name="next" value="delivered" />
                <button type="submit" className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50">
                  Mark Delivered
                </button>
              </form>
            )}

            {load.status === "delivered" && (
              hasPod ? (
                <p className="text-sm font-light text-textMuted">
                  Delivered{load.delivered_at ? "" : ""}. POD on file — this load is ready to invoice. ✓
                </p>
              ) : (
                <div>
                  <p className="mb-3 text-sm font-light text-textMuted">
                    Delivered. Upload your POD to mark this load ready to invoice.
                  </p>
                  <DocumentUpload carrierId={load.carrier_id} fixedType="pod" loadId={load.id} />
                </div>
              )
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Documents */}
        <div className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-textMuted">Documents</h2>
          {docs.length === 0 ? (
            <p className="text-sm font-light text-textMuted">No documents linked to this load yet.</p>
          ) : (
            <ul className="space-y-3">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-textPrimary">{DOC_LABELS[d.type]}</span>
                  <DocBadge status={d.status} />
                </li>
              ))}
            </ul>
          )}
          <Link href="/portal/documents" className="mt-4 inline-block text-sm font-medium text-gold hover:underline">
            Manage documents →
          </Link>
        </div>

        {/* Settlement */}
        <div className="rounded-2xl border border-portalBorder bg-bgSurface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-textMuted">Settlement</h2>
          {!settlement ? (
            <p className="text-sm font-light text-textMuted">No settlement recorded for this load yet.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-textMuted">Gross</dt>
                <dd className="font-medium text-textPrimary">{fmtMoney(settlement.gross, true)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-textMuted">Dispatch fee</dt>
                <dd className="font-medium text-gold">−{fmtMoney(settlement.dispatch_fee, true)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-portalBorder pt-3">
                <dt className="font-medium text-textPrimary">Net to you</dt>
                <dd className="text-base font-bold text-textPrimary">{fmtMoney(settlement.net, true)}</dd>
              </div>
              <div className="flex items-center justify-between pt-1">
                <dt className="text-textMuted">Status</dt>
                <dd><SettlementBadge status={settlement.status} /></dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
