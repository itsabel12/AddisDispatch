"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DOC_LABELS, type DocType } from "@/lib/portal/types";

const TYPES = Object.keys(DOC_LABELS) as DocType[];

export default function DocumentUpload({
  carrierId,
  fixedType,
  loadId,
}: {
  carrierId: string;
  fixedType?: DocType;
  loadId?: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState<DocType>(fixedType ?? "coi");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    // Path MUST start with the carrier id — Storage RLS enforces this folder.
    const path = `${carrierId}/${type}/${Date.now()}-${safeName}`;

    const { error: upErr } = await supabase.storage
      .from("carrier-documents")
      .upload(path, file, { upsert: false });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    const { error: insErr } = await supabase
      .from("documents")
      .insert({ carrier_id: carrierId, type, file_path: path, status: "pending", load_id: loadId ?? null });
    if (insErr) {
      setError(insErr.message);
      setBusy(false);
      return;
    }

    setBusy(false);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-portalBorder bg-bgSurface p-5"
    >
      <h2 className="text-sm font-semibold text-textPrimary">
        {fixedType ? `Upload ${DOC_LABELS[fixedType]}` : "Upload a document"}
      </h2>
      <p className="mt-1 text-xs font-light text-textMuted">PDF or image. We&apos;ll verify it.</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        {!fixedType && (
          <div className="flex-1">
            <label htmlFor="doc-type" className="mb-1.5 block text-xs font-medium text-textMuted">
              Type
            </label>
            <select
              id="doc-type"
              value={type}
              onChange={(e) => setType(e.target.value as DocType)}
              className="w-full rounded-xl border border-portalBorder bg-bgElevated px-3 py-2.5 text-sm text-textPrimary focus:border-gold/60 focus:outline-none"
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {DOC_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex-[2]">
          <label htmlFor="doc-file" className="mb-1.5 block text-xs font-medium text-textMuted">
            File
          </label>
          <input
            id="doc-file"
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-xl border border-portalBorder bg-bgElevated px-3 py-2 text-sm text-textMuted file:mr-3 file:rounded-full file:border-0 file:bg-gold file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-black"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-black transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Uploading…" : "Upload"}
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </form>
  );
}
