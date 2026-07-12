"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getMyDocuments,
  uploadMyDocument,
  type CarrierDocument,
} from "@/lib/carrier-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { IconChip } from "@/components/carrier/ui";
import { FileText } from "@/components/icons";

const DOC_TYPES = [
  { value: "w9", label: "W-9", hint: "Taxpayer identification form" },
  { value: "certificate_of_insurance", label: "Certificate of Insurance", hint: "Current COI from your insurer" },
  { value: "authority_letter", label: "Authority Letter", hint: "Your MC authority document" },
] as const;

const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : null);

const docIcon = <FileText size={18} />;

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
    <main className="mx-auto w-full max-w-3xl p-5 lg:p-8">
      <PageHeader
        title="Documents"
        subtitle="Your onboarding documents. We need all three on file (and current) to keep dispatching your loads."
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => onFile(e.target.files)}
      />

      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          {DOC_TYPES.map(({ value, label, hint }) => {
            const doc = newestByType.get(value);
            const expires = fmtDate(doc?.expires_at ?? null);
            return (
              <div key={value} className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <IconChip>{docIcon}</IconChip>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc
                        ? `On file: ${doc.filename}${expires ? ` · expires ${expires}` : ""}`
                        : hint}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge tone={doc ? "success" : "accent"} dot>
                    {doc ? "Received" : "Needed"}
                  </Badge>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => pick(value)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-accent hover:text-accentDeep disabled:opacity-50"
                  >
                    {doc ? "Upload newer" : "Upload"}
                  </button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {loading && <p className="mt-4 text-sm text-muted-foreground">Loading…</p>}
    </main>
  );
}
