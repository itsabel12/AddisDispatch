"use client";

/**
 * Lists brokers (with load counts) and lets you edit contact info or delete a
 * broker. Data comes from GET /brokers; edits use PUT /brokers/{id}.
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
  deleteBroker,
  getBrokers,
  updateBroker,
  type Broker,
  type BrokerInput,
} from "@/lib/api";

const FIELD = "w-full rounded border px-2 py-1 text-sm";
const COLS = 7;

/** "" -> null for optional text fields. */
function orNull(v: string): string | null {
  return v.trim() === "" ? null : v.trim();
}

function BrokerEditForm({
  broker,
  onSaved,
  onCancel,
}: {
  broker: Broker;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const [form, setForm] = useState({
    name: broker.name,
    mc_number: broker.mc_number ?? "",
    contact_email: broker.contact_email ?? "",
    contact_phone: broker.contact_phone ?? "",
    notes: broker.notes ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: BrokerInput = {
        name: form.name.trim(),
        mc_number: orNull(form.mc_number),
        contact_email: orNull(form.contact_email),
        contact_phone: orNull(form.contact_phone),
        notes: orNull(form.notes),
      };
      const token = await getToken();
      await updateBroker(token, broker.id, payload);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save broker");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-4 rounded-md border bg-muted/30 p-4"
    >
      <p className="mb-3 text-sm font-medium">Edit broker</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Name *
          <input
            className={FIELD}
            required
            value={form.name}
            onChange={set("name")}
          />
        </label>
        <label className="text-sm">
          MC #
          <input
            className={FIELD}
            value={form.mc_number}
            onChange={set("mc_number")}
          />
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
          {submitting ? "Saving…" : "Update broker"}
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

export function BrokersTable() {
  const { getToken } = useAuth();
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Broker | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      setBrokers(await getBrokers(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleDelete(broker: Broker) {
    if (
      !window.confirm(
        `Delete broker "${broker.name}"?\n\nIts ${broker.load_count} load(s) keep the name but are unlinked.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const token = await getToken();
      await deleteBroker(token, broker.id);
      if (editing?.id === broker.id) setEditing(null);
      setMsg("Broker deleted.");
      await reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 p-3 text-sm text-danger">
          Could not load data: {error}. Is the backend running on{" "}
          <code className="rounded bg-muted px-1">http://localhost:8000</code>?
        </p>
      )}
      {msg && <p className="mb-3 text-sm text-muted-foreground">{msg}</p>}

      {editing && (
        <BrokerEditForm
          key={editing.id}
          broker={editing}
          onSaved={() => {
            setEditing(null);
            setMsg("Broker updated.");
            void reload();
          }}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Broker</TableHead>
              <TableHead>Loads</TableHead>
              <TableHead>MC #</TableHead>
              <TableHead>Email</TableHead>
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
            ) : brokers.length ? (
              brokers.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell>{b.load_count}</TableCell>
                  <TableCell>{b.mc_number ?? "—"}</TableCell>
                  <TableCell>{b.contact_email ?? "—"}</TableCell>
                  <TableCell>{b.contact_phone ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {b.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="text-xs text-blue-700 hover:underline"
                        onClick={() => setEditing(b)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        className="text-xs text-red-700 hover:underline disabled:opacity-50"
                        onClick={() => handleDelete(b)}
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
                  No brokers yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
