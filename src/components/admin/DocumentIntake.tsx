"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getDocuments,
  uploadDocument,
  getDocument,
  fetchDocumentPreview,
  approveDocument,
  rejectDocument,
  deleteDocument,
  type IntakeDocument,
  type ExtractedFields,
  type LoadInput,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

const STATUS_STYLE: Record<string, string> = {
  uploaded: "border-border bg-muted text-muted-foreground",
  processing: "border-accent/30 bg-accent/10 text-accent",
  extracted: "border-accent/40 bg-accent/10 text-accent",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
  approved: "border-success/40 bg-success/10 text-success",
  rejected: "border-border bg-muted text-muted-foreground",
};

/** ISO string -> value for <input type="datetime-local"> (or ""). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** datetime-local value -> ISO string (or null). */
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type FormState = {
  broker_name: string;
  origin_city: string;
  origin_state: string;
  dest_city: string;
  dest_state: string;
  pickup_at: string;
  delivery_at: string;
  rate: string;
  loaded_miles: string;
  weight_lbs: string;
  carrier_cost: string;
  fuel_cost: string;
};

function emptyForm(): FormState {
  return {
    broker_name: "",
    origin_city: "",
    origin_state: "",
    dest_city: "",
    dest_state: "",
    pickup_at: "",
    delivery_at: "",
    rate: "",
    loaded_miles: "",
    weight_lbs: "",
    carrier_cost: "",
    fuel_cost: "",
  };
}

function formFromExtraction(fields: ExtractedFields | undefined): FormState {
  const f = emptyForm();
  if (!fields) return f;
  return {
    ...f,
    broker_name: fields.broker_name ?? "",
    origin_city: fields.origin_city ?? "",
    origin_state: (fields.origin_state ?? "").slice(0, 2).toUpperCase(),
    dest_city: fields.dest_city ?? "",
    dest_state: (fields.dest_state ?? "").slice(0, 2).toUpperCase(),
    pickup_at: toLocalInput(fields.pickup_at),
    delivery_at: toLocalInput(fields.delivery_at),
    rate: fields.rate != null ? String(fields.rate) : "",
    loaded_miles: fields.loaded_miles != null ? String(fields.loaded_miles) : "",
    weight_lbs: fields.weight_lbs != null ? String(fields.weight_lbs) : "",
  };
}

const num = (v: string): number | null => (v.trim() === "" ? null : Number(v));

// Extra AI-read fields that don't map onto a load column — shown for reference.
const REFERENCE_KEYS: (keyof ExtractedFields)[] = [
  "customer",
  "commodity",
  "equipment",
  "driver",
  "carrier",
  "reference_numbers",
  "notes",
];

export function DocumentIntake() {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<IntakeDocument[]>([]);
  const [selected, setSelected] = useState<IntakeDocument | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setDocuments(await getDocuments(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Poll while any document is still processing so the list updates live.
  useEffect(() => {
    const anyProcessing = documents.some(
      (d) => d.status === "processing" || d.status === "uploaded",
    );
    if (!anyProcessing) return;
    const t = setInterval(() => void refresh(), 2500);
    return () => clearInterval(t);
  }, [documents, refresh]);

  // Load a preview blob whenever the selected document changes.
  useEffect(() => {
    let revoked: string | null = null;
    setPreviewUrl(null);
    if (!selected) return;
    (async () => {
      try {
        const url = await fetchDocumentPreview(await getToken(), selected);
        revoked = url;
        setPreviewUrl(url);
      } catch {
        setPreviewUrl(null);
      }
    })();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [selected, getToken]);

  function selectDocument(doc: IntakeDocument) {
    setError(null);
    setSelected(doc);
    setForm(formFromExtraction(doc.extraction?.fields));
  }

  async function onUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getToken();
      for (const file of Array.from(files)) {
        await uploadDocument(token, file);
      }
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onApprove() {
    if (!selected) return;
    if (!form.broker_name || !form.origin_city || !form.dest_city) {
      setError("Broker, origin, and destination are required to create a load.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const input: LoadInput = {
        broker_name: form.broker_name.trim(),
        origin_city: form.origin_city.trim(),
        origin_state: form.origin_state.trim().toUpperCase(),
        dest_city: form.dest_city.trim(),
        dest_state: form.dest_state.trim().toUpperCase(),
        pickup_at: fromLocalInput(form.pickup_at),
        rate: num(form.rate),
        loaded_miles: num(form.loaded_miles),
        weight_lbs: num(form.weight_lbs),
      };
      // The backend LoadCreate also accepts delivery_at + costs; send them too.
      const extended = {
        ...input,
        delivery_at: fromLocalInput(form.delivery_at),
        carrier_cost: num(form.carrier_cost),
        fuel_cost: num(form.fuel_cost),
      } as LoadInput;
      await approveDocument(await getToken(), selected.id, extended);
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onReject() {
    if (!selected) return;
    setBusy(true);
    try {
      await rejectDocument(await getToken(), selected.id);
      setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(doc: IntakeDocument) {
    setBusy(true);
    try {
      await deleteDocument(await getToken(), doc.id);
      if (selected?.id === doc.id) setSelected(null);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  const referenceFields = selected?.extraction?.fields
    ? REFERENCE_KEYS.map((k) => [k, selected.extraction?.fields?.[k]] as const).filter(
        ([, v]) => v != null && v !== "",
      )
    : [];
  const confidence = selected?.extraction?.confidence;

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Load Intake"
        subtitle="Upload a rate confirmation or tender — AI reads it, you review and create the load in one click."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => fileRef.current?.click()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
            >
              {busy ? "Working…" : "Upload document"}
            </button>
          </>
        }
      />

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Document list */}
        <div className="rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documents
          </div>
          <ul className="divide-y divide-border">
            {documents.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                {loading ? "Loading…" : "No documents yet."}
              </li>
            ) : (
              documents.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => selectDocument(doc)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition-colors hover:bg-muted ${
                      selected?.id === doc.id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {doc.filename}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {doc.type.replace(/_/g, " ")}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                        STATUS_STYLE[doc.status] ?? STATUS_STYLE.uploaded
                      }`}
                    >
                      {doc.status}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Review panel */}
        <div className="rounded-xl border border-border">
          {!selected ? (
            <div className="flex h-full min-h-[400px] items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Select a document to review its extracted fields.
            </div>
          ) : (
            <div className="grid gap-0 md:grid-cols-2">
              {/* Source preview */}
              <div className="border-b border-border p-4 md:border-b-0 md:border-r">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source
                  </span>
                  <button
                    type="button"
                    onClick={() => onDelete(selected)}
                    disabled={busy}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>
                <div className="h-[420px] overflow-hidden rounded-lg border border-border bg-black/20">
                  {!previewUrl ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Loading preview…
                    </div>
                  ) : selected.content_type === "application/pdf" ? (
                    <iframe src={previewUrl} title={selected.filename} className="h-full w-full" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt={selected.filename}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                {selected.status === "failed" && (
                  <p className="mt-2 text-xs text-destructive">
                    AI extraction unavailable — enter the fields manually.
                  </p>
                )}
                {referenceFields.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Also read
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {referenceFields.map(([k, v]) => (
                        <span
                          key={k}
                          className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          <span className="capitalize">{k.replace(/_/g, " ")}:</span>{" "}
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Editable fields */}
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Review &amp; create load
                  </span>
                  {confidence != null && (
                    <span className="text-xs text-muted-foreground">
                      {Math.round(confidence * 100)}% confidence
                    </span>
                  )}
                </div>

                {selected.status === "approved" ? (
                  <p className="rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
                    A load was created from this document.
                  </p>
                ) : selected.status === "rejected" ? (
                  <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
                    This document was rejected.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Broker" span2>
                        <Input value={form.broker_name} onChange={(v) => setForm({ ...form, broker_name: v })} />
                      </Field>
                      <Field label="Origin city">
                        <Input value={form.origin_city} onChange={(v) => setForm({ ...form, origin_city: v })} />
                      </Field>
                      <Field label="Origin state">
                        <Input value={form.origin_state} maxLength={2} onChange={(v) => setForm({ ...form, origin_state: v.toUpperCase() })} />
                      </Field>
                      <Field label="Dest city">
                        <Input value={form.dest_city} onChange={(v) => setForm({ ...form, dest_city: v })} />
                      </Field>
                      <Field label="Dest state">
                        <Input value={form.dest_state} maxLength={2} onChange={(v) => setForm({ ...form, dest_state: v.toUpperCase() })} />
                      </Field>
                      <Field label="Pickup">
                        <Input type="datetime-local" value={form.pickup_at} onChange={(v) => setForm({ ...form, pickup_at: v })} />
                      </Field>
                      <Field label="Delivery">
                        <Input type="datetime-local" value={form.delivery_at} onChange={(v) => setForm({ ...form, delivery_at: v })} />
                      </Field>
                      <Field label="Rate ($)">
                        <Input type="number" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} />
                      </Field>
                      <Field label="Loaded miles">
                        <Input type="number" value={form.loaded_miles} onChange={(v) => setForm({ ...form, loaded_miles: v })} />
                      </Field>
                      <Field label="Weight (lbs)">
                        <Input type="number" value={form.weight_lbs} onChange={(v) => setForm({ ...form, weight_lbs: v })} />
                      </Field>
                      <Field label="Carrier cost ($)">
                        <Input type="number" value={form.carrier_cost} onChange={(v) => setForm({ ...form, carrier_cost: v })} />
                      </Field>
                      <Field label="Fuel cost ($)">
                        <Input type="number" value={form.fuel_cost} onChange={(v) => setForm({ ...form, fuel_cost: v })} />
                      </Field>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={onApprove}
                        disabled={busy}
                        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accentDeep disabled:opacity-50"
                      >
                        Approve &amp; create load
                      </button>
                      <button
                        type="button"
                        onClick={onReject}
                        disabled={busy}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  span2,
  children,
}: {
  label: string;
  span2?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${span2 ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  maxLength,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
    />
  );
}
