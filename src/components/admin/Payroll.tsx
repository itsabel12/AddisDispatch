"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getPayrollQueue,
  getPayrollHistory,
  updatePayrollItem,
  approvePayroll,
  payPayroll,
  getSettlements,
  createSettlement,
  openSettlementPdf,
  exportPayrollCsv,
  type PayrollItem,
  type PayrollItemUpdate,
  type Settlement,
} from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/badge";
import { useToast } from "@/components/admin/feedback";

const money = (n: number | null) =>
  n == null
    ? "—"
    : n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const COMPONENTS: { key: keyof PayrollItemUpdate; label: string }[] = [
  { key: "gross_pay", label: "Gross" },
  { key: "detention", label: "Detention" },
  { key: "layover", label: "Layover" },
  { key: "bonus", label: "Bonus" },
  { key: "lumper", label: "Lumper" },
  { key: "fuel_advance", label: "Fuel adv." },
  { key: "other_deductions", label: "Other ded." },
  { key: "dispatcher_commission", label: "Commission" },
];

export function Payroll() {
  const { getToken } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<"queue" | "history" | "settlements">("queue");
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (tab === "settlements") {
        setSettlements(await getSettlements(token));
      } else {
        setItems(tab === "queue" ? await getPayrollQueue(token) : await getPayrollHistory(token));
      }
      setSelected(new Set());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payroll.");
    } finally {
      setLoading(false);
    }
  }, [getToken, tab]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function startEdit(item: PayrollItem) {
    setEditing(item.id);
    const d: Record<string, string> = {};
    for (const c of COMPONENTS) {
      const v = item[c.key as keyof PayrollItem] as number | null;
      d[c.key] = v == null ? "" : String(v);
    }
    setDraft(d);
  }

  async function saveEdit(item: PayrollItem) {
    setBusy(true);
    try {
      const payload: PayrollItemUpdate = {};
      for (const c of COMPONENTS) {
        const raw = draft[c.key];
        payload[c.key] = raw === "" ? null : Number(raw);
      }
      await updatePayrollItem(await getToken(), item.id, payload);
      setEditing(null);
      toast.success("Payroll item recomputed.");
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function bulk(action: "approve" | "pay") {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusy(true);
    try {
      const token = await getToken();
      const n = action === "approve" ? await approvePayroll(token, ids) : await payPayroll(token, ids);
      toast.success(`${n} item(s) ${action === "approve" ? "approved" : "paid"}.`);
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${action} failed.`);
    } finally {
      setBusy(false);
    }
  }

  async function makeSettlement() {
    const chosen = items.filter((i) => selected.has(i.id));
    if (chosen.length === 0) return;
    const carriers = new Set(chosen.map((i) => i.carrier_id));
    if (carriers.size > 1) {
      toast.error("A settlement must be for a single carrier — narrow your selection.");
      return;
    }
    setBusy(true);
    try {
      const batch = await createSettlement(await getToken(), [...selected]);
      toast.success(
        `Settlement created for ${batch.carrier_name ?? "carrier"}: ${batch.item_count} load(s), ${money(
          batch.total,
        )}. See the Settlements tab.`,
      );
      await reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Settlement failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleExportCsv() {
    setBusy(true);
    try {
      await exportPayrollCsv(await getToken(), tab === "history" ? "paid" : undefined);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  async function openStatement(batchId: string) {
    setBusy(true);
    try {
      await openSettlementPdf(await getToken(), batchId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open statement.");
    } finally {
      setBusy(false);
    }
  }

  const pendingSelected = items.some((i) => selected.has(i.id) && i.status === "pending");
  const approvedSelected = items.some((i) => selected.has(i.id) && i.status === "approved");
  // Only approved/paid items can be bundled into a settlement statement.
  const settleableSelected =
    selected.size > 0 &&
    items
      .filter((i) => selected.has(i.id))
      .every((i) => i.status === "approved" || i.status === "paid");

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Payroll"
        subtitle="What AddisDispatch owes carriers for delivered loads, net of deductions."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={busy}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Export CSV
            </button>
            <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
              {(["queue", "history", "settlements"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium capitalize transition-colors ${
                    tab === t ? "bg-accent text-black shadow-soft" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {tab === "queue" && selected.size > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{selected.size} selected</span>
          {pendingSelected && (
            <button
              type="button"
              disabled={busy}
              onClick={() => bulk("approve")}
              className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accentDeep disabled:opacity-50"
            >
              Approve selected
            </button>
          )}
          {approvedSelected && (
            <button
              type="button"
              disabled={busy}
              onClick={() => bulk("pay")}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              Mark paid
            </button>
          )}
          {settleableSelected && (
            <button
              type="button"
              disabled={busy}
              onClick={makeSettlement}
              className="rounded-lg border border-accent px-3 py-1.5 text-sm font-medium text-accentDeep hover:bg-accent/10 disabled:opacity-50"
            >
              Create settlement
            </button>
          )}
        </div>
      )}

      {tab === "settlements" ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Carrier</TableHead>
                <TableHead>Pay period</TableHead>
                <TableHead className="text-right">Loads</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Statement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    {loading
                      ? "Loading…"
                      : "No settlements yet. Select approved items in the queue and click “Create settlement”."}
                  </TableCell>
                </TableRow>
              ) : (
                settlements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.carrier_name ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.period_start ? s.period_start.slice(0, 10) : "—"} –{" "}
                      {s.period_end ? s.period_end.slice(0, 10) : "—"}
                    </TableCell>
                    <TableCell className="text-right">{s.item_count}</TableCell>
                    <TableCell className="text-right font-semibold">{money(s.total)}</TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openStatement(s.id)}
                        className="text-xs text-accentDeep hover:underline disabled:opacity-50"
                      >
                        Statement PDF
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              {tab === "queue" && <TableHead className="w-8" />}
              <TableHead>Carrier / Lane</TableHead>
              <TableHead className="text-right">Gross</TableHead>
              <TableHead className="text-right">Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : tab === "queue" ? "No payroll to review." : "No paid history yet."}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <Fragment key={item.id}>
                  <TableRow>
                    {tab === "queue" && (
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggle(item.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <span className="block text-sm font-medium">{item.carrier_name ?? "—"}</span>
                      <span className="block text-xs text-muted-foreground">{item.lane ?? ""}</span>
                    </TableCell>
                    <TableCell className="text-right">{money(item.gross_pay)}</TableCell>
                    <TableCell className="text-right font-semibold">{money(item.net_pay)}</TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status !== "paid" && (
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => (editing === item.id ? setEditing(null) : startEdit(item))}
                            className="text-xs text-blue-500 hover:underline"
                          >
                            {editing === item.id ? "Close" : "Edit"}
                          </button>
                          {item.status === "pending" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={async () => {
                                await approvePayroll(await getToken(), [item.id]);
                                await reload();
                              }}
                              className="text-xs text-accent hover:underline disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {item.status === "approved" && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={async () => {
                                await payPayroll(await getToken(), [item.id]);
                                await reload();
                              }}
                              className="text-xs text-success hover:underline disabled:opacity-50"
                            >
                              Pay
                            </button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  {editing === item.id && (
                    <TableRow>
                      <TableCell colSpan={6} className="bg-muted/40">
                        <div className="grid grid-cols-2 gap-3 py-2 sm:grid-cols-4">
                          {COMPONENTS.map((c) => (
                            <label key={c.key} className="block text-xs">
                              <span className="mb-1 block text-muted-foreground">{c.label}</span>
                              <input
                                type="number"
                                step="0.01"
                                value={draft[c.key] ?? ""}
                                onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.value }))}
                                className="w-full rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
                              />
                            </label>
                          ))}
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => saveEdit(item)}
                          className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accentDeep disabled:opacity-50"
                        >
                          Save &amp; recompute
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}
    </main>
  );
}
