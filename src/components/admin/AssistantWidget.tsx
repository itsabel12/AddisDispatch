"use client";

import { useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { askAssistant } from "@/lib/api";
import { X, Sparkles } from "@/components/icons";

type Turn = { role: "you" | "ai"; text: string };

export function AssistantWidget() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setTurns((t) => [...t, { role: "you", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const answer = await askAssistant(await getToken(), q);
      setTurns((t) => [...t, { role: "ai", text: answer }]);
    } catch (e) {
      setTurns((t) => [
        ...t,
        { role: "ai", text: e instanceof Error ? e.message : "Something went wrong." },
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black shadow-lg transition-transform hover:scale-105"
        aria-label="AI assistant"
      >
        {open ? <X size={20} /> : <Sparkles size={20} />}
      </button>

      {open && (
        <div className="portal-scope fixed bottom-20 right-5 z-50 flex h-[480px] w-[360px] flex-col rounded-xl border border-border bg-card shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">AI Assistant</p>
            <p className="text-xs text-muted-foreground">
              Ask about loads, invoices, profitability… (read-only)
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {turns.length === 0 ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Try:</p>
                {[
                  "What are my active loads?",
                  "Which lanes are least profitable this week?",
                  "How much is outstanding on invoices?",
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInput(s)}
                    className="block w-full rounded-lg border border-border px-3 py-2 text-left hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : (
              turns.map((t, i) => (
                <div key={i} className={`flex ${t.role === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      t.role === "you"
                        ? "bg-accent text-black"
                        : "border border-border bg-background text-foreground"
                    }`}
                  >
                    {t.text}
                  </div>
                </div>
              ))
            )}
            {busy && <p className="text-xs text-muted-foreground">Thinking…</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </>
  );
}
