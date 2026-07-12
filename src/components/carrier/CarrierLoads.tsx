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
  fetchMyAttachmentUrl,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/carrier/ui";
import { Package } from "@/components/icons";
import { LoadChat } from "@/components/chat/LoadChat";
import { money, lane, formatDate } from "@/components/carrier/format";

const truckIcon = <Package size={22} />;

const actionBtn =
  "rounded-lg border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-accent hover:text-accentDeep disabled:opacity-50";

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
    <main className="mx-auto w-full max-w-6xl p-5 lg:p-8">
      <PageHeader
        title="My Loads"
        subtitle="Every load assigned to your account. Upload a POD once you've delivered."
      />

      {/* Shared hidden picker — no `capture` so mobile offers camera OR files. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
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
        <CardHeader>
          <CardTitle>Assigned loads</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {loads.length === 0 ? (
            <EmptyState
              icon={truckIcon}
              title={loading ? "Loading…" : "No loads assigned yet"}
              body={loading ? undefined : "When your dispatcher assigns you a load, it shows up here."}
            />
          ) : (
            <div className="overflow-x-auto">
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
                  {loads.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{lane(l)}</TableCell>
                      <TableCell>{l.broker_name}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(l.pickup_at)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(l.delivery_at)}</TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-right">{money(l.rate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => setChatLoad(l)} className={actionBtn}>
                            Chat
                          </button>
                          <button
                            type="button"
                            disabled={uploadingId === l.id}
                            onClick={() => pickPod(l.id)}
                            className={actionBtn}
                          >
                            {uploadingId === l.id ? "Uploading…" : "Upload POD"}
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {chatLoad && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setChatLoad(null)}
        >
          <div
            className="flex h-[560px] w-full max-w-lg flex-col rounded-2xl border border-border bg-card p-4 shadow-2xl"
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
                className="rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted"
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
                fetchAttachmentUrl={fetchMyAttachmentUrl}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
