import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getPortalContext } from "@/lib/portal/session";
import { fmtDate, daysUntil } from "@/lib/portal/format";
import { DOC_LABELS, type DocType, type DocumentRow } from "@/lib/portal/types";
import PageHeader from "@/components/portal/PageHeader";
import { DocBadge, Badge } from "@/components/portal/Badge";
import DocumentUpload from "@/components/portal/DocumentUpload";

export const metadata: Metadata = { title: "Documents — AddisDispatch Portal" };

const ORDER = Object.keys(DOC_LABELS) as DocType[];

export default async function DocumentsPage() {
  const { carrier } = await getPortalContext();
  const supabase = await createClient();

  const { data } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });
  const docs = (data ?? []) as DocumentRow[];

  // Carrier-scoped signed URLs (1 hour). Missing objects simply yield no link.
  const signed: Record<string, string> = {};
  await Promise.all(
    docs
      .filter((d) => d.file_path)
      .map(async (d) => {
        const { data: s } = await supabase.storage
          .from("carrier-documents")
          .createSignedUrl(d.file_path as string, 3600);
        if (s?.signedUrl) signed[d.id] = s.signedUrl;
      }),
  );

  const groups = ORDER.map((type) => ({
    type,
    items: docs.filter((d) => d.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader title="Documents" subtitle="Authority, insurance, and load paperwork." />

      <div className="mb-8">
        <DocumentUpload carrierId={carrier.id} />
      </div>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-portalBorder bg-bgSurface p-10 text-center text-sm font-light text-textMuted">
          No documents uploaded yet.
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.type}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-textMuted">
                {DOC_LABELS[g.type]}
              </h2>
              <div className="overflow-hidden rounded-2xl border border-portalBorder bg-bgSurface">
                <ul className="divide-y divide-portalBorder">
                  {g.items.map((d) => {
                    const n = daysUntil(d.expires_at);
                    const expiringSoon = n != null && n >= 0 && n <= 14;
                    const expired = d.status === "expired" || (n != null && n < 0);
                    return (
                      <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <DocBadge status={d.status} />
                            {expired ? (
                              <Badge tone="red">Expired</Badge>
                            ) : expiringSoon ? (
                              <Badge tone="gold">Expires in {n}d</Badge>
                            ) : null}
                          </div>
                          <div className="mt-1.5 text-xs font-light text-textMuted">
                            Uploaded {fmtDate(d.uploaded_at)}
                            {d.expires_at && <> · Expires {fmtDate(d.expires_at)}</>}
                          </div>
                        </div>
                        {signed[d.id] ? (
                          <a
                            href={signed[d.id]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full border border-portalBorder px-4 py-1.5 text-xs font-medium text-textPrimary transition-colors hover:border-gold/50 hover:text-gold"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs font-light text-textMuted/60">File unavailable</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
