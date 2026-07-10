"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getPayrollQueue,
  getPayrollHistory,
  updatePayrollItem,
  approvePayroll,
  payPayroll,
  type PayrollItem,
  type PayrollItemUpdate,
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
  const [tab, setTab] = useState<"queue" | "history">("queue");
  const [items, setItems] = useState<PayrollItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getToken();
      setItems(tab === "queue" ? await getPayrollQueue(token) : await getPayrollHistory(token));
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
    setError(null);
    try {
      const payload: PayrollItemUpdate = {};
      for (const c of COMPONENTS) {
        const raw = draft[c.key];
        payload[c.key] = raw === "" ? null : Number(raw);
      }
      await updatePayrollItem(await getToken(), item.id, payload);
      setEditing(null);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
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
    setError(null);
    setMessage(null);
    try {
      const token = await getToken();
      const n = action === "approve" ? await approvePayroll(token, ids) : await payPayroll(token, ids);
      setMessage(`${n} item(s) ${action === "approve" ? "approved" : "paid"}.`);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : `${action} failed.`);
    } finally {
      setBusy(false);
    }
  }

  const pendingSelected = items.some((i) => selected.has(i.id) && i.status === "pending");
  const approvedSelected = items.some((i) => selected.has(i.id) && i.status === "approved");

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Payroll"
        subtitle="What AddisDispatch owes carriers for delivered loads, net of deductions."
        actions={
          <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
            {(["queue", "history"] as const).map((t) => (
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
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && <p className="mb-4 text-sm text-success">{message}</p>}

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
        </div>
      )}

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
    </main>
  );
}
