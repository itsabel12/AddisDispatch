"use client";

/**
 * Lists carriers (with assigned-load counts) and lets you add, edit, or delete
 * them. Unlike brokers, carriers are created by hand here.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
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
  createCarrier,
  deleteCarrier,
  getCarriers,
  updateCarrier,
  type Carrier,
  type CarrierInput,
} from "@/lib/api";

const FIELD = "w-full rounded border px-2 py-1 text-sm";
const COLS = 7;

/** "" -> null for optional text fields. */
function orNull(v: string): string | null {
  return v.trim() === "" ? null : v.trim();
}

function CarrierForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Carrier | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    mc_number: initial?.mc_number ?? "",
    dot_number: initial?.dot_number ?? "",
    contact_email: initial?.contact_email ?? "",
    contact_phone: initial?.contact_phone ?? "",
    notes: initial?.notes ?? "",
    pay_type: initial?.pay_type ?? "percentage",
    pay_rate: initial?.pay_rate != null ? String(initial.pay_rate) : "",
    // Stored as a fraction (0.10); shown/entered as a percent (10).
    commission_pct:
      initial?.dispatcher_commission_pct != null
        ? String(initial.dispatcher_commission_pct * 100)
        : "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  // What "Pay rate" means depends on the pay type.
  const rateHint =
    form.pay_type === "percentage"
      ? "% of load rate"
      : form.pay_type === "flat_per_mile"
        ? "$ per loaded mile"
        : "$ per load";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: CarrierInput = {
        name: form.name.trim(),
        mc_number: orNull(form.mc_number),
        dot_number: orNull(form.dot_number),
        contact_email: orNull(form.contact_email),
        contact_phone: orNull(form.contact_phone),
        notes: orNull(form.notes),
        pay_type: form.pay_type,
        pay_rate: form.pay_rate.trim() === "" ? null : Number(form.pay_rate),
        dispatcher_commission_pct:
          form.commission_pct.trim() === "" ? null : Number(form.commission_pct) / 100,
      };
      const token = await getToken();
      if (initial) {
        await updateCarrier(token, initial.id, payload);
      } else {
        await createCarrier(token, payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save carrier");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-md border bg-muted/30 p-4"
    >
      <p className="mb-3 text-sm font-medium">
        {isEdit ? "Edit carrier" : "New carrier"}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Name *
          <input className={FIELD} required value={form.name} onChange={set("name")} />
        </label>
        <label className="text-sm">
          MC #
          <input className={FIELD} value={form.mc_number} onChange={set("mc_number")} />
        </label>
        <label className="text-sm">
          DOT #
          <input className={FIELD} value={form.dot_number} onChange={set("dot_number")} />
        </label>
        <label className="text-sm">
          Email
          <input
            type="email"
            className={FIELD}
            value={form.contact_email}
            onChange={set("contact_email")}
          />
        </label>
        <label className="text-sm">
          Phone
          <input
            className={FIELD}
            value={form.contact_phone}
            onChange={set("contact_phone")}
          />
        </label>
        <label className="col-span-2 text-sm sm:col-span-3">
          Notes
          <textarea
            className={FIELD}
            rows={2}
            value={form.notes}
            onChange={set("notes")}
          />
        </label>
      </div>

      <p className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pay profile (drives payroll)
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Pay type
          <select className={FIELD} value={form.pay_type} onChange={set("pay_type")}>
            <option value="percentage">Percentage</option>
            <option value="flat_per_mile">Flat per mile</option>
            <option value="flat_per_load">Flat per load</option>
          </select>
        </label>
        <label className="text-sm">
          Pay rate <span className="text-muted-foreground">({rateHint})</span>
          <input
            type="number"
            step="0.01"
            className={FIELD}
            value={form.pay_rate}
            onChange={set("pay_rate")}
          />
        </label>
        <label className="text-sm">
          Dispatcher commission %
          <input
            type="number"
            step="0.1"
            className={FIELD}
            value={form.commission_pct}
            onChange={set("commission_pct")}
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
          {submitting ? "Saving…" : isEdit ? "Update carrier" : "Save carrier"}
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

export function CarriersTable() {
  const { getToken } = useAuth();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Carrier | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      setCarriers(await getCarriers(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (carrier: Carrier) => {
    setEditing(carrier);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  async function handleDelete(carrier: Carrier) {
    if (
      !window.confirm(
        `Delete carrier "${carrier.name}"?\n\nIts ${carrier.load_count} assigned load(s) will be unassigned.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      await deleteCarrier(token, carrier.id);
      if (editing?.id === carrier.id) closeForm();
      setMsg("Carrier deleted.");
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => (formOpen && !editing ? closeForm() : openCreate())}
          className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep"
        >
          {formOpen && !editing ? "Close" : "+ Add carrier"}
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          Could not load data: {error}. Is the backend running on{" "}
          <code>http://localhost:8000</code>?
        </p>
      )}
      {msg && <p className="mb-3 text-sm text-muted-foreground">{msg}</p>}

      {formOpen && (
        <CarrierForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => {
            const wasEdit = Boolean(editing);
            closeForm();
            setMsg(wasEdit ? "Carrier updated." : "Carrier created.");
            void reload();
          }}
          onCancel={closeForm}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Carrier</TableHead>
              <TableHead>Loads</TableHead>
              <TableHead>MC #</TableHead>
              <TableHead>DOT #</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Notes</TableHead>
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
            ) : carriers.length ? (
              carriers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.load_count}</TableCell>
                  <TableCell>{c.mc_number ?? "—"}</TableCell>
                  <TableCell>{c.dot_number ?? "—"}</TableCell>
                  <TableCell>{c.contact_phone ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {c.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/carriers/${c.id}`}
                        className="text-xs font-medium text-accentDeep hover:underline"
                      >
                        Compliance
                      </Link>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-red-700 hover:underline disabled:opacity-50"
                        onClick={() => handleDelete(c)}
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
                  No carriers yet. Click “+ Add carrier” to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
