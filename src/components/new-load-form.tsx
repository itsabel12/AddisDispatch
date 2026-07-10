"use client";

/**
 * Form to add OR edit a load. With `initial`, it edits that load (PUT);
 * without it, it creates a new one (POST). The backend computes
 * rpm/score/recommendation either way. On success it calls onSaved() so the
 * parent can refresh the table.
 */

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  createLoad,
  getCarriers,
  updateLoad,
  type Carrier,
  type Load,
  type LoadInput,
} from "@/lib/api";

const STATUSES = ["new", "booked", "in_transit", "delivered", "issue"];

const FIELD = "w-full rounded border px-2 py-1 text-sm";

type FormState = {
  broker_name: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_at: string;
  rate: string;
  loaded_miles: string;
  deadhead_miles: string;
  weight_lbs: string;
  status: string;
  carrier_id: string; // "" = unassigned
};

/** Build the form's initial state from an existing load (or blanks). */
function formFromLoad(load: Load | null | undefined): FormState {
  const numStr = (v: number | null) => (v === null || v === undefined ? "" : String(v));
  return {
    broker_name: load?.broker_name ?? "",
    origin_city: load?.origin_city ?? "",
    origin_state: load?.origin_state ?? "",
    dest_city: load?.dest_city ?? "",
    dest_state: load?.dest_state ?? "",
    // ISO timestamp -> "YYYY-MM-DD" for the date input.
    pickup_at: load?.pickup_at ? load.pickup_at.slice(0, 10) : "",
    rate: numStr(load?.rate ?? null),
    loaded_miles: numStr(load?.loaded_miles ?? null),
    deadhead_miles: numStr(load?.deadhead_miles ?? null),
    weight_lbs: numStr(load?.weight_lbs ?? null),
    status: load?.status ?? "new",
    carrier_id: load?.carrier_id ?? "",
  };
}

/** "" -> null, otherwise a Number. */
function toNum(v: string): number | null {
  return v.trim() === "" ? null : Number(v);
}

export function NewLoadForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial?: Load | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { getToken } = useAuth();
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>(() => formFromLoad(initial));
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load carriers to populate the assignment dropdown.
  useEffect(() => {
    let active = true;
    getToken()
      .then((token) => getCarriers(token))
      .then((data) => {
        if (active) setCarriers(data);
      })
      .catch(() => {
        /* non-fatal: the dropdown just stays empty */
      });
    return () => {
      active = false;
    };
  }, [getToken]);

  const set =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload: LoadInput = {
        broker_name: form.broker_name.trim(),
        origin_city: form.origin_city.trim(),
        origin_state: form.origin_state.trim().toUpperCase(),
        dest_city: form.dest_city.trim(),
        dest_state: form.dest_state.trim().toUpperCase(),
        pickup_at: form.pickup_at
          ? new Date(form.pickup_at).toISOString()
          : null,
        rate: toNum(form.rate),
        loaded_miles: toNum(form.loaded_miles),
        deadhead_miles: toNum(form.deadhead_miles),
        weight_lbs: toNum(form.weight_lbs),
        status: form.status,
        carrier_id: form.carrier_id || null,
      };
      const token = await getToken();
      if (initial) {
        await updateLoad(token, initial.id, payload);
      } else {
        await createLoad(token, payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save load");
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
        {isEdit ? "Edit load" : "New load"}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className="text-sm">
          Broker *
          <input
            className={FIELD}
            required
            value={form.broker_name}
            onChange={set("broker_name")}
          />
        </label>
        <label className="text-sm">
          Origin city *
          <input
            className={FIELD}
            required
            value={form.origin_city}
            onChange={set("origin_city")}
          />
        </label>
        <label className="text-sm">
          Origin state *
          <input
            className={FIELD}
            required
            maxLength={2}
            placeholder="IL"
            value={form.origin_state}
            onChange={set("origin_state")}
          />
        </label>
        <label className="text-sm">
          Dest city *
          <input
            className={FIELD}
            required
            value={form.dest_city}
            onChange={set("dest_city")}
          />
        </label>
        <label className="text-sm">
          Dest state *
          <input
            className={FIELD}
            required
            maxLength={2}
            placeholder="IN"
            value={form.dest_state}
            onChange={set("dest_state")}
          />
        </label>
        <label className="text-sm">
          Pickup date
          <input
            type="date"
            className={FIELD}
            value={form.pickup_at}
            onChange={set("pickup_at")}
          />
        </label>
        <label className="text-sm">
          Rate ($)
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.rate}
            onChange={set("rate")}
          />
        </label>
        <label className="text-sm">
          Loaded miles
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.loaded_miles}
            onChange={set("loaded_miles")}
          />
        </label>
        <label className="text-sm">
          Deadhead miles
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.deadhead_miles}
            onChange={set("deadhead_miles")}
          />
        </label>
        <label className="text-sm">
          Weight (lbs)
          <input
            type="number"
            min={0}
            step="1"
            className={FIELD}
            value={form.weight_lbs}
            onChange={set("weight_lbs")}
          />
        </label>
        <label className="text-sm">
          Status
          <select
            className={FIELD}
            value={form.status}
            onChange={set("status")}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Carrier
          <select
            className={FIELD}
            value={form.carrier_id}
            onChange={set("carrier_id")}
          >
            <option value="">— Unassigned —</option>
            {carriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
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
          className="rounded bg-foreground px-3 py-1.5 text-sm text-background disabled:opacity-50"
        >
          {submitting ? "Saving…" : isEdit ? "Update load" : "Save load"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Cancel
        </button>
        <span className="self-center text-xs text-muted-foreground">
          rpm, score &amp; recommendation are computed automatically.
        </span>
      </div>
    </form>
  );
}
