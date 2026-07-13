"use client";

import { useState } from "react";

import {
  getLoads,
  getLoadMessages,
  postLoadMessage,
  summarizeThread,
  uploadAdminChatAttachment,
  openAdminAttachment,
  fetchAdminAttachmentUrl,
  type Load,
} from "@/lib/api";
import { LoadChat } from "@/components/chat/LoadChat";
import { PageHeader } from "@/components/ui/page-header";
import { useQuery } from "@/lib/useQuery";

export function AdminMessages() {
  // Threads exist per load; surface only loads that have a carrier assigned.
  const { data, loading, error } = useQuery<Load[]>(
    async (token) => (await getLoads(token)).filter((l) => l.carrier_id),
    { fallbackError: "Failed to load loads." },
  );
  const loads = data ?? [];
  const [selected, setSelected] = useState<Load | null>(null);

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader title="Messages" subtitle="Secure chat with carriers, per load." />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-border">
          <div className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Loads with carriers
          </div>
          <ul className="max-h-[520px] divide-y divide-border overflow-y-auto">
            {loads.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                {loading ? "Loading…" : "No assigned loads yet."}
              </li>
            ) : (
              loads.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(l)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-muted ${
                      selected?.id === l.id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="block text-sm font-medium">
                      {l.origin_city}, {l.origin_state} → {l.dest_city}, {l.dest_state}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {l.carrier_name ?? "Carrier"} · {l.broker_name}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="h-[560px] rounded-xl border border-border p-4">
          {selected ? (
            <LoadChat
              key={selected.id}
              loadId={selected.id}
              role="admin"
              list={getLoadMessages}
              send={postLoadMessage}
              summarize={summarizeThread}
              uploadAttachment={uploadAdminChatAttachment}
              openAttachment={openAdminAttachment}
              fetchAttachmentUrl={fetchAdminAttachmentUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Select a load to open its thread.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
