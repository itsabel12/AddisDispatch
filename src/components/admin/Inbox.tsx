"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

import {
  getInbox,
  getEmailDocuments,
  archiveEmail,
  markEmailHandled,
  replyEmail,
  type InboundEmail,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/admin/feedback";

const CLASS_STYLE: Record<string, string> = {
  load_tender: "border-accent/40 bg-accent/10 text-accent",
  rate_confirmation: "border-accent/40 bg-accent/10 text-accent",
  payment_notice: "border-success/40 bg-success/10 text-success",
  invoice_question: "border-success/40 bg-success/10 text-success",
  carrier_update: "border-border bg-muted text-muted-foreground",
  driver_message: "border-border bg-muted text-muted-foreground",
  general_inquiry: "border-border bg-muted text-muted-foreground",
  unclassified: "border-border bg-muted text-muted-foreground",
};

const CREATE_LOAD_CLASSES = new Set(["rate_confirmation", "load_tender"]);

export function Inbox() {
  const { getToken } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [busy, setBusy] = useState(false);

  // Deep-link into Load Intake: find the rate-con attachment this email became a
  // Document for, and open its review directly. Falls back to the intake page.
  async function onCreateLoad(email: InboundEmail) {
    setBusy(true);
    try {
      const docs = await getEmailDocuments(await getToken(), email.id);
      const doc = docs[0];
      if (doc) {
        router.push(`/admin/loads/intake?doc=${doc.id}`);
      } else {
        toast.info("No attachment found on this email — upload the rate con in Load Intake.");
        router.push("/admin/loads/intake");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't open Load Intake.");
    } finally {
      setBusy(false);
    }
  }

  const reload = useCallback(async () => {
    try {
      setEmails(await getInbox(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the inbox.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
    const t = setInterval(() => void reload(), 5000);
    return () => clearInterval(t);
  }, [reload]);

  async function onArchive(id: string) {
    setBusy(true);
    try {
      await archiveEmail(await getToken(), id);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function onHandled(id: string) {
    setBusy(true);
    try {
      await markEmailHandled(await getToken(), id);
      await reload();
    } finally {
      setBusy(false);
    }
  }

  async function onSendReply(email: InboundEmail) {
    setBusy(true);
    setError(null);
    try {
      await replyEmail(await getToken(), email.id, {
        subject: `Re: ${email.subject ?? ""}`,
        body: replyBody,
      });
      setReplyTo(null);
      setReplyBody("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reply failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Inbox"
        subtitle="Incoming emails, AI-classified with suggested actions. Attachments are routed to Load Intake automatically."
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : emails.length === 0 ? (
        <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
          Inbox is empty. Emails forwarded to your Resend inbound address appear
          here.
        </div>
      ) : (
        <ul className="space-y-3">
          {emails.map((email) => (
            <li key={email.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{email.subject || "(no subject)"}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                        CLASS_STYLE[email.classification] ?? CLASS_STYLE.unclassified
                      }`}
                    >
                      {email.classification.replace(/_/g, " ")}
                    </span>
                    {email.status === "handled" && (
                      <span className="text-[10px] text-muted-foreground">✓ handled</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{email.from_address}</p>
                  {email.summary && (
                    <p className="mt-1 text-sm text-muted-foreground">{email.summary}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {CREATE_LOAD_CLASSES.has(email.classification) && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onCreateLoad(email)}
                    className="rounded-lg border border-accent/50 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/10 disabled:opacity-50"
                  >
                    Create Load →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(replyTo === email.id ? null : email.id);
                    setReplyBody("");
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Reply
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onHandled(email.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  Mark handled
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onArchive(email.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                >
                  Archive
                </button>
              </div>

              {replyTo === email.id && (
                <div className="mt-3">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={3}
                    placeholder={`Reply to ${email.from_address}…`}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      disabled={busy || !replyBody.trim()}
                      onClick={() => onSendReply(email)}
                      className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-black hover:bg-accentDeep disabled:opacity-50"
                    >
                      Send reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
