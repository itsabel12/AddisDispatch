"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import type { ChatMessage, ChatMessageInput } from "@/lib/api";

type ClientRole = "admin" | "carrier";

export function LoadChat({
  loadId,
  role,
  list,
  send,
  summarize,
}: {
  loadId: string;
  role: ClientRole;
  list: (token: string | null, loadId: string) => Promise<ChatMessage[]>;
  send: (
    token: string | null,
    loadId: string,
    input: ChatMessageInput,
  ) => Promise<ChatMessage>;
  summarize?: (token: string | null, loadId: string) => Promise<string>;
}) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const reload = useCallback(async () => {
    try {
      setMessages(await list(await getToken(), loadId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load messages.");
    }
  }, [getToken, list, loadId]);

  useEffect(() => {
    void reload();
    const t = setInterval(() => void reload(), 4000);
    return () => clearInterval(t);
  }, [reload]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function doSend(input: ChatMessageInput) {
    setBusy(true);
    setError(null);
    try {
      await send(await getToken(), loadId, input);
      setText("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed.");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    void doSend({ body: text.trim() });
  }

  function shareLocation() {
    if (!navigator.geolocation) {
      setError("Location is not available in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        void doSend({
          body: "📍 Shared location",
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }),
      () => setError("Could not get your location."),
    );
  }

  async function doSummarize() {
    if (!summarize) return;
    setSummary("Summarizing…");
    try {
      setSummary(await summarize(await getToken(), loadId));
    } catch {
      setSummary("Could not summarize.");
    }
  }

  return (
    <div className="flex h-full flex-col">
      {summarize && (
        <div className="mb-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={doSummarize}
            className="text-xs text-accent hover:underline"
          >
            AI summarize thread
          </button>
        </div>
      )}
      {summary && (
        <p className="mb-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-muted-foreground">
          {summary}
        </p>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-border bg-background p-3">
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === role;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "bg-accent text-black"
                      : "border border-border bg-card text-foreground"
                  }`}
                >
                  {m.body && <p className="whitespace-pre-wrap">{m.body}</p>}
                  {m.latitude != null && m.longitude != null && (
                    <a
                      href={`https://maps.google.com/?q=${m.latitude},${m.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-xs underline"
                    >
                      View on map
                    </a>
                  )}
                  <span
                    className={`mt-1 block text-[10px] ${mine ? "text-black/60" : "text-muted-foreground"}`}
                  >
                    {m.sender_role} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

      <form onSubmit={onSubmit} className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={shareLocation}
          disabled={busy}
          title="Share location"
          className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
        >
          📍
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accentDeep disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
