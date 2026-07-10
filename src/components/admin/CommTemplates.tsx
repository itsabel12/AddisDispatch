"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getCommTemplates,
  updateCommTemplate,
  type CommTemplate,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";

const PLACEHOLDERS = ["broker", "lane", "origin", "dest", "rate", "eta", "pickup", "delivery"];

export function CommTemplates() {
  const { getToken } = useAuth();
  const [templates, setTemplates] = useState<CommTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setTemplates(await getCommTemplates(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function patch(key: string, changes: Partial<CommTemplate>) {
    setTemplates((ts) => ts.map((t) => (t.key === key ? { ...t, ...changes } : t)));
  }

  async function save(t: CommTemplate) {
    setSavingKey(t.key);
    setError(null);
    setMessage(null);
    try {
      await updateCommTemplate(await getToken(), t.key, {
        subject: t.subject,
        body: t.body,
        enabled: t.enabled,
      });
      setMessage(`Saved "${t.key.replace(/_/g, " ")}".`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Customer Emails"
        subtitle="Branded milestone emails, sent automatically to the customer as a load moves through its lifecycle."
      />
      <p className="mb-6 -mt-3 text-xs text-muted-foreground/70">
        Placeholders you can use:{" "}
        {PLACEHOLDERS.map((p) => (
          <code key={p} className="mr-1 rounded bg-muted px-1">{`{{${p}}}`}</code>
        ))}
      </p>

      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {message && <p className="mb-4 text-sm text-success">{message}</p>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="space-y-4">
          {templates.map((t) => (
            <div key={t.key} className="rounded-xl border border-border bg-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold capitalize">{t.key.replace(/_/g, " ")}</h2>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={t.enabled}
                    onChange={(e) => patch(t.key, { enabled: e.target.checked })}
                  />
                  Enabled
                </label>
              </div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Subject
              </label>
              <input
                value={t.subject}
                onChange={(e) => patch(t.key, { subject: e.target.value })}
                className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-accent"
              />
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Body
              </label>
              <textarea
                value={t.body}
                onChange={(e) => patch(t.key, { body: e.target.value })}
                rows={4}
                className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <button
                type="button"
                disabled={savingKey === t.key}
                onClick={() => save(t)}
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-black hover:bg-accentDeep disabled:opacity-50"
              >
                {savingKey === t.key ? "Saving…" : "Save"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
