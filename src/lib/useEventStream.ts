"use client";

/**
 * useEventStream — subscribe the Command Center to the backend's real-time
 * Server-Sent Events stream (`GET /admin/events/stream`).
 *
 * Native EventSource can't attach an Authorization header, and our backend gates
 * the stream behind the Clerk bearer token, so we consume it with `fetch()`
 * streaming instead. The hook auto-reconnects with a short backoff and cleans up
 * on unmount.
 *
 * Usage:
 *   useEventStream({
 *     notification: (data) => { ...refresh badge... },
 *     load_updated: (data) => { ...refetch loads... },
 *   });
 */

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

type EventHandler = (data: unknown) => void;
type Handlers = Record<string, EventHandler>;

export function useEventStream(handlers: Handlers, enabled = true) {
  const { getToken } = useAuth();
  // Keep the latest handlers without re-opening the stream on every render.
  // Sync in a commit-phase effect (not during render) so the stream loop always
  // reads the freshest handlers via the ref.
  const handlersRef = useRef<Handlers>(handlers);
  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let stopped = false;

    async function connect() {
      while (!stopped) {
        try {
          const token = await getToken();
          const res = await fetch(`${API_BASE}/admin/events/stream`, {
            headers: { Authorization: `Bearer ${token ?? ""}` },
            signal: controller.signal,
          });
          if (!res.ok || !res.body) throw new Error(`stream status ${res.status}`);

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (!stopped) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });

            // SSE frames are separated by a blank line.
            let sep: number;
            while ((sep = buffer.indexOf("\n\n")) !== -1) {
              const frame = buffer.slice(0, sep);
              buffer = buffer.slice(sep + 2);
              dispatchFrame(frame, handlersRef.current);
            }
          }
        } catch {
          if (stopped || controller.signal.aborted) return;
          // Brief backoff, then reconnect.
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    void connect();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [enabled, getToken]);
}

function dispatchFrame(frame: string, handlers: Handlers) {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of frame.split("\n")) {
    if (line.startsWith(":")) continue; // comment / keep-alive
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  const handler = handlers[event];
  if (!handler) return;
  const raw = dataLines.join("\n");
  try {
    handler(raw ? JSON.parse(raw) : null);
  } catch {
    handler(raw);
  }
}
