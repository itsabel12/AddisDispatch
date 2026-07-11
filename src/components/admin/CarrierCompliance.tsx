"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

import {
  getCarriers,
  getCarrierCompliance,
  getCarrierDocuments,
  uploadCarrierDocument,
  requestCarrierDocuments,
  updateDocumentMeta,
  fetchDocumentPreview,
  verifyCarrierSafer,
  COMPLIANCE_DOC_TYPES,
  type Carrier,
  type ComplianceSummary,
  type ComplianceItem,
  type IntakeDocument,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";

const fmtDate = (iso: string | null) => (iso ? iso.slice(0, 10) : "—");

function itemState(item: ComplianceItem): { label: string; tone: "success" | "warning" | "danger" | "neutral" } {
  if (!item.present) return { label: "Missing", tone: "danger" };
  if (item.expired) return { label: "Expired", tone: "danger" };
  if (item.expiring_soon) return { label: "Expiring soon", tone: "warning" };
  return { label: "On file", tone: "success" };
}

const SAFER_STATE: Record<
  string,
  { label: string; tone: "success" | "warning" | "danger" | "neutral" }
> = {
  verified: { label: "Authorized", tone: "success" },
  not_authorized: { label: "Not authorized", tone: "danger" },
  not_found: { label: "Not found", tone: "danger" },
  error: { label: "Check failed", tone: "warning" },
  unconfigured: { label: "Not configured", tone: "neutral" },
};

export function CarrierCompliance({ carrierId }: { carrierId: string }) {
  const { getToken } = useAuth();
  const [carrier, setCarrier] = useState<Carrier | null>(null);
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [documents, setDocuments] = useState<IntakeDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expiryDraft, setExpiryDraft] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const pendingType = useRef<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const token = await getToken();
      const [carriers, comp, docs] = await Promise.all([
        getCarriers(token),
        getCarrierCompliance(token, carrierId),
        getCarrierDocuments(token, carrierId),
      ]);
      setCarrier(carriers.find((c) => c.id === carrierId) ?? null);
      setSummary(comp);
      setDocuments(docs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load compliance.");
    } finally {
      setLoading(false);
    }
  }, [getToken, carrierId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Poll briefly while AI is reading a fresh upload (for the expiry date).
  useEffect(() => {
    const processing = documents.some(
      (d) => d.status === "uploaded" || d.status === "processing",
    );
    if (!processing) return;
    const t = setInterval(() => void reload(), 2500);
    return () => clearInterval(t);
  }, [documents, reload]);

  function pickFile(docType: string) {
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
      await uploadCarrierDocument(await getToken(), carrierId, files[0], docType);
      setMessage("Uploaded — AI is reading the expiry date now.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      pendingType.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onRequestDocs() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await requestCarrierDocuments(await getToken(), carrierId);
      setMessage("Document request emailed to the carrier.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerifySafer() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await verifyCarrierSafer(await getToken(), carrierId);
      const label = SAFER_STATE[updated.safer_status ?? ""]?.label ?? updated.safer_status;
      setMessage(`FMCSA check complete: ${label}.`);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function onView(doc: IntakeDocument) {
    try {
      const url = await fetchDocumentPreview(await getToken(), doc);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not open the document.");
    }
  }

  async function saveExpiry(doc: IntakeDocument) {
    const raw = expiryDraft[doc.id];
    if (raw === undefined) return;
    setBusy(true);
    try {
      await updateDocumentMeta(await getToken(), doc.id, {
        type: doc.type,
        expires_at: raw ? new Date(raw + "T00:00:00Z").toISOString() : null,
      });
      setExpiryDraft((d) => {
        const next = { ...d };
        delete next[doc.id];
        return next;
      });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title={
          <>
            <Link href="/admin/carriers" className="text-muted-foreground hover:text-foreground">
              Carriers
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            {carrier?.name ?? "Compliance"}
          </>
        }
        subtitle={
          carrier ? (
            <>
              MC {carrier.mc_number ?? "—"} · DOT {carrier.dot_number ?? "—"} ·{" "}
              {carrier.contact_email ?? "no email on file"}
              {carrier.docs_requested_at && (
                <> · packet sent {fmtDate(carrier.docs_requested_at)}</>
              )}
            </>
          ) : (
            "Compliance documents on file for this carrier."
          )
        }
        actions={
          <button
            type="button"
            disabled={busy}
            onClick={onRequestDocs}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
          >
            {carrier?.docs_requested_at ? "Resend document request" : "Send document request"}
          </button>
        }
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
      {message && <p className="mb-4 text-sm text-success">{message}</p>}

      {/* FMCSA / SAFER verification */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm">FMCSA / SAFER authority</CardTitle>
            {carrier?.safer_status ? (
              <Badge tone={SAFER_STATE[carrier.safer_status]?.tone ?? "neutral"} dot>
                {SAFER_STATE[carrier.safer_status]?.label ?? carrier.safer_status}
              </Badge>
            ) : (
              <Badge tone="neutral" dot>Not checked</Badge>
            )}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onVerifySafer}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/50 hover:text-accentDeep disabled:opacity-50"
          >
            {carrier?.safer_checked_at ? "Re-verify with FMCSA" : "Verify with FMCSA"}
          </button>
        </CardHeader>
        <CardContent className="pt-1">
          {carrier?.safer_data ? (
            <div className="grid gap-x-6 gap-y-1 text-xs text-muted-foreground sm:grid-cols-2">
              {carrier.safer_data.legal_name && (
                <span>Legal name: <span className="text-foreground">{carrier.safer_data.legal_name}</span></span>
              )}
              <span>
                Allowed to operate:{" "}
                <span className="text-foreground">
                  {carrier.safer_data.allowed_to_operate == null
                    ? "—"
                    : carrier.safer_data.allowed_to_operate ? "Yes" : "No"}
                </span>
              </span>
              <span>
                Insurance on file:{" "}
                <span className="text-foreground">
                  {carrier.safer_data.bipd_insurance_on_file == null
                    ? "—"
                    : carrier.safer_data.bipd_insurance_on_file ? "Yes" : "No"}
                </span>
              </span>
              {carrier.safer_data.safety_rating && (
                <span>Safety rating: <span className="text-foreground">{carrier.safer_data.safety_rating}</span></span>
              )}
              {carrier.safer_data.detail && (
                <span className="sm:col-span-2">{carrier.safer_data.detail}</span>
              )}
              {carrier.safer_checked_at && (
                <span className="sm:col-span-2">Last checked {fmtDate(carrier.safer_checked_at)}</span>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Loading…"
                : "Authority and insurance haven't been verified against FMCSA yet."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Compliance checklist */}
      <div className="grid gap-4 sm:grid-cols-3">
        {COMPLIANCE_DOC_TYPES.map(({ value, label }) => {
          const item = summary?.[value as keyof ComplianceSummary] as ComplianceItem | undefined;
          const state = item ? itemState(item) : null;
          return (
            <Card key={value}>
              <CardHeader>
                <CardTitle className="text-sm">{label}</CardTitle>
                {state && <Badge tone={state.tone} dot>{state.label}</Badge>}
              </CardHeader>
              <CardContent className="pt-1">
                <p className="text-xs text-muted-foreground">
                  {loading
                    ? "Loading…"
                    : item?.present
                      ? item.expires_at
                        ? `Expires ${fmtDate(item.expires_at)}`
                        : "No expiry on file"
                      : "Not on file yet."}
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => pickFile(value)}
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-accent/50 hover:text-accentDeep disabled:opacity-50"
                >
                  {item?.present ? "Upload newer version" : "Upload"}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vault contents */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Documents on file</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {documents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nothing in this carrier&apos;s vault yet. Upload above or send the
              document request.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {documents.map((doc) => (
                <li key={doc.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{doc.filename}</p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {doc.type.replace(/_/g, " ")} · added {fmtDate(doc.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={doc.status} />
                  <div className="flex items-center gap-1.5 text-xs">
                    <input
                      type="date"
                      value={expiryDraft[doc.id] ?? (doc.expires_at ? doc.expires_at.slice(0, 10) : "")}
                      onChange={(e) =>
                        setExpiryDraft((d) => ({ ...d, [doc.id]: e.target.value }))
                      }
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs"
                      aria-label="Expiry date"
                    />
                    {expiryDraft[doc.id] !== undefined && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => saveExpiry(doc)}
                        className="font-medium text-accentDeep hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onView(doc)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
