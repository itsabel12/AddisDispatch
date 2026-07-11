"use client";

/**
 * Invoices: create one from a load, then track it (draft -> sent -> paid).
 * Create form has a load picker that prefills the amount from the load's rate.
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  getLoads,
  updateInvoice,
  sendInvoice,
  sweepOverdueInvoices,
  openInvoicePdf,
  openFactoringPacket,
  remindInvoice,
  exportInvoicesCsv,
  type Invoice,
  type InvoiceCreateInput,
  type InvoiceUpdateInput,
  type Load,
} from "@/lib/api";

const FIELD = "w-full rounded border px-2 py-1 text-sm";
const COLS = 8;
const STATUSES = ["draft", "sent", "viewed", "paid", "overdue"];

function money(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function fmtDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "—";
}

function statusBadgeClass(status: string): string {
  const base = "inline-block rounded px-2 py-0.5 text-xs font-medium ";
  if (status === "paid") return base + "bg-green-100 text-green-800";
  if (status === "overdue") return base + "bg-red-100 text-red-800";
  if (status === "viewed") return base + "bg-blue-100 text-blue-800";
  if (status === "sent") return base + "bg-amber-100 text-amber-800";
  return base + "bg-gray-100 text-gray-700"; // draft
}

function orNull(v: string): string | null {
  return v.trim() === "" ? null : v.trim();
}
function toNum(v: string): number | null {
  return v.trim() === "" ? null : Number(v);
}

function InvoiceCreateForm({
  onSaved,
  onCancel,
}: {
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [form, setForm] = useState({
    load_id: "",
    amount: "",
    due_at: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getToken()
      .then((token) => getLoads(token))
      .then(setLoads)
      .catch(() => {
        /* dropdown just stays empty */
      });
  }, [getToken]);

  // Picking a load prefills the amount from that load's rate.
  function onPickLoad(e: React.ChangeEvent<HTMLSelectElement>) {
    const load_id = e.target.value;
    const load = loads.find((l) => l.id === load_id);
    setForm((f) => ({
      ...f,
      load_id,
      amount: load && load.rate !== null ? String(load.rate) : f.amount,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.load_id) {
      setError("Pick a load to invoice.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload: InvoiceCreateInput = {
        load_id: form.load_id,
        amount: toNum(form.amount),
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        notes: orNull(form.notes),
      };
      const token = await getToken();
      await createInvoice(token, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-md border bg-muted/30 p-4">
      <p className="mb-3 text-sm font-medium">New invoice</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm sm:col-span-2">
          Load *
          <select className={FIELD} required value={form.load_id} onChange={onPickLoad}>
            <option value="">Select a load…</option>
            {loads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.broker_name} — {l.origin_city}, {l.origin_state} →{" "}
                {l.dest_city}, {l.dest_state}
                {l.rate !== null ? ` ($${l.rate})` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Amount ($)
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Due date
          <input
            type="date"
            className={FIELD}
            value={form.due_at}
            onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Notes
          <textarea
            className={FIELD}
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
      </div>
      {error && (
        <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Create invoice"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Cancel
        </button>
        <span className="self-center text-xs text-muted-foreground">
          Amount defaults to the load&apos;s rate; due date defaults to +30 days.
        </span>
      </div>
    </form>
  );
}

function InvoiceEditForm({
  invoice,
  onSaved,
  onCancel,
}: {
  invoice: Invoice;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    status: invoice.status,
    amount: invoice.amount !== null ? String(invoice.amount) : "",
    due_at: invoice.due_at ? invoice.due_at.slice(0, 10) : "",
    notes: invoice.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: InvoiceUpdateInput = {
        status: form.status,
        amount: toNum(form.amount),
        due_at: form.due_at ? new Date(form.due_at).toISOString() : null,
        notes: orNull(form.notes),
      };
      const token = await getToken();
      await updateInvoice(token, invoice.id, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invoice");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4 rounded-md border bg-muted/30 p-4">
      <p className="mb-3 text-sm font-medium">
        Edit {invoice.invoice_number}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Status
          <select
            className={FIELD}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Amount ($)
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          Due date
          <input
            type="date"
            className={FIELD}
            value={form.due_at}
            onChange={(e) => setForm((f) => ({ ...f, due_at: e.target.value }))}
          />
        </label>
        <label className="col-span-2 text-sm sm:col-span-3">
          Notes
          <textarea
            className={FIELD}
            rows={2}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </label>
      </div>
      {error && (
        <p className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Update invoice"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function InvoicesTable() {
  const { getToken } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      setInvoices(await getInvoices(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleDelete(invoice: Invoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return;
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      await deleteInvoice(token, invoice.id);
      if (editing?.id === invoice.id) setEditing(null);
      setMsg("Invoice deleted.");
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend(invoice: Invoice) {
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      const updated = await sendInvoice(token, invoice.id);
      setMsg(`Invoice ${updated.invoice_number} sent.`);
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Send failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleSweep() {
    setBusy(true);
    setMsg(null);
    try {
      const n = await sweepOverdueInvoices(await getToken());
      setMsg(n === 0 ? "No invoices are overdue." : `${n} invoice(s) marked overdue.`);
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Sweep failed");
    } finally {
      setBusy(false);
    }
  }

  // Auth-gated file actions (open PDF in a tab, download CSV, email a reminder).
  async function withBusy(action: () => Promise<void>, failMsg: string) {
    setBusy(true);
    setMsg(null);
    try {
      await action();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : failMsg);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemind(invoice: Invoice) {
    await withBusy(async () => {
      const token = await getToken();
      await remindInvoice(token, invoice.id);
      setMsg(`Payment reminder sent for ${invoice.invoice_number}.`);
    }, "Reminder failed");
  }

  async function handleExportCsv() {
    await withBusy(async () => {
      const token = await getToken();
      await exportInvoicesCsv(token);
    }, "Export failed");
  }

  async function handleOpenPdf(invoice: Invoice) {
    await withBusy(async () => {
      const token = await getToken();
      await openInvoicePdf(token, invoice.id);
    }, "Could not open PDF");
  }

  async function handleOpenPacket(invoice: Invoice) {
    await withBusy(async () => {
      const token = await getToken();
      await openFactoringPacket(token, invoice.id);
    }, "Could not open packet");
  }

  return (
    <>
      <div className="mb-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={handleSweep}
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
        >
          Sweep overdue
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreating((v) => !v);
          }}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep"
        >
          {creating ? "Close" : "+ New invoice"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Could not load data: {error}. Is the backend running on{" "}
          <code>http://localhost:8000</code>?
        </p>
      )}
      {msg && <p className="mb-3 text-sm text-muted-foreground">{msg}</p>}

      {creating && (
        <InvoiceCreateForm
          onSaved={() => {
            setCreating(false);
            setMsg("Invoice created.");
            void reload();
          }}
          onCancel={() => setCreating(false)}
        />
      )}
      {editing && (
        <InvoiceEditForm
          key={editing.id}
          invoice={editing}
          onSaved={() => {
            setEditing(null);
            setMsg("Invoice updated.");
            void reload();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Lane</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead>Due</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : invoices.length ? (
              invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.broker_name ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">{inv.lane ?? "—"}</TableCell>
                  <TableCell>{money(inv.amount)}</TableCell>
                  <TableCell>
                    <span className={statusBadgeClass(inv.status)}>{inv.status}</span>
                  </TableCell>
                  <TableCell>{fmtDate(inv.issued_at)}</TableCell>
                  <TableCell>{fmtDate(inv.due_at)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-3">
                      {(inv.status === "draft" || inv.status === "overdue") && (
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs text-emerald-700 hover:underline disabled:opacity-50"
                          onClick={() => handleSend(inv)}
                        >
                          Send
                        </button>
                      )}
                      {(inv.status === "sent" ||
                        inv.status === "viewed" ||
                        inv.status === "overdue") && (
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs text-amber-700 hover:underline disabled:opacity-50"
                          onClick={() => handleRemind(inv)}
                        >
                          Remind
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-accentDeep hover:underline disabled:opacity-50"
                        onClick={() => handleOpenPdf(inv)}
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-accentDeep hover:underline disabled:opacity-50"
                        onClick={() => handleOpenPacket(inv)}
                      >
                        Packet
                      </button>
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => {
                          setCreating(false);
                          setEditing(inv);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-red-700 hover:underline disabled:opacity-50"
                        onClick={() => handleDelete(inv)}
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center">
                  No invoices yet. Click “+ New invoice” to bill a load.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
