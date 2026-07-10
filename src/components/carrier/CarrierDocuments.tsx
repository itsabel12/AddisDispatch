"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getMyDocuments,
  uploadMyDocument,
  type CarrierDocument,
} from "@/lib/carrier-api";

const DOC_TYPES = [
  { value: "w9", label: "W-9", hint: "Taxpayer identification form" },
  { value: "certificate_of_insurance", label: "Certificate of Insurance", hint: "Current COI from your insurer" },
  { value: "authority_letter", label: "Authority Letter", hint: "Your MC authority document" },
] as const;

const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : null);

export function CarrierDocuments() {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<CarrierDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingType = useRef<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setDocuments(await getMyDocuments(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your documents.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function pick(docType: string) {
    setError(null);
    setMessage(null);
    pendingType.current = docType;
    fileRef.current?.click();
  }

  async function onFile(files: FileList | null) {
    const docType = pendingType.current;
    if (!files || files.length === 0 || !docType) return;
    setBusy(true);
    try {
      await uploadMyDocument(await getToken(), files[0], docType);
      setMessage("Uploaded — thank you! Your dispatcher will see it right away.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      pendingType.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // The newest document per type (a re-upload supersedes older ones).
  const newestByType = new Map<string, CarrierDocument>();
  for (const d of documents) {
    if (!newestByType.has(d.type)) newestByType.set(d.type, d);
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">Documents</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your onboarding documents. We need all three on file (and current) to
        keep dispatching your loads.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-6 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      <div className="space-y-4">
        {DOC_TYPES.map(({ value, label, hint }) => {
          const doc = newestByType.get(value);
          const expires = fmtDate(doc?.expires_at ?? null);
          return (
            <div
              key={value}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {doc
                    ? `On file: ${doc.filename}${expires ? ` · expires ${expires}` : ""}`
                    : hint}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                    doc
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-accent/40 bg-accent/10 text-accent"
                  }`}
                >
                  {doc ? "Received" : "Needed"}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => pick(value)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  {doc ? "Upload newer" : "Upload"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
    </main>
  );
}
