"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getMyLoads,
  uploadPod,
  getMyLoadMessages,
  postMyLoadMessage,
  uploadMyChatAttachment,
  openMyAttachment,
} from "@/lib/carrier-api";
import type { Load } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadChat } from "@/components/chat/LoadChat";
import { money, lane, formatDate } from "@/components/carrier/format";

export function CarrierLoads() {
  const { getToken } = useAuth();
  const [loads, setLoads] = useState<Load[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [chatLoad, setChatLoad] = useState<Load | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const targetLoad = useRef<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLoads(await getMyLoads(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your loads.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function pickPod(loadId: string) {
    setMessage(null);
    setError(null);
    targetLoad.current = loadId;
    fileRef.current?.click();
  }

  async function onFile(files: FileList | null) {
    const loadId = targetLoad.current;
    if (!files || files.length === 0 || !loadId) return;
    setUploadingId(loadId);
    try {
      await uploadPod(await getToken(), loadId, files[0]);
      setMessage("POD uploaded — your dispatcher will review it shortly.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "POD upload failed.");
    } finally {
      setUploadingId(null);
      targetLoad.current = null;
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">My Loads</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Every load assigned to your account. Upload a POD once you&apos;ve
        delivered.
      </p>

      {/* Shared hidden picker — no `capture` so mobile offers camera OR files. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
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

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lane</TableHead>
              <TableHead>Broker</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Rate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No loads assigned to you yet."}
                </TableCell>
              </TableRow>
            ) : (
              loads.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{lane(l)}</TableCell>
                  <TableCell>{l.broker_name}</TableCell>
                  <TableCell>{formatDate(l.pickup_at)}</TableCell>
                  <TableCell>{formatDate(l.delivery_at)}</TableCell>
                  <TableCell className="capitalize">{l.status.replace("_", " ")}</TableCell>
                  <TableCell className="text-right">{money(l.rate)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setChatLoad(l)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent"
                      >
                        Chat
                      </button>
                      <button
                        type="button"
                        disabled={uploadingId === l.id}
                        onClick={() => pickPod(l.id)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:border-accent hover:text-accent disabled:opacity-50"
                      >
                        {uploadingId === l.id ? "Uploading…" : "Upload POD"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {chatLoad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setChatLoad(null)}
        >
          <div
            className="flex h-[560px] w-full max-w-lg flex-col rounded-xl border border-border bg-card p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{lane(chatLoad)}</p>
                <p className="text-xs text-muted-foreground">Chat with your dispatcher</p>
              </div>
              <button
                type="button"
                onClick={() => setChatLoad(null)}
                className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <LoadChat
                loadId={chatLoad.id}
                role="carrier"
                list={getMyLoadMessages}
                send={postMyLoadMessage}
                uploadAttachment={uploadMyChatAttachment}
                openAttachment={openMyAttachment}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
