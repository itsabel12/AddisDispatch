"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";

import { RequireAdmin } from "@/components/require-admin";
import {
  LifeBuoy,
  Mail,
  MessageCircle,
  Clock,
  Copy,
  Check,
} from "@/components/icons";
import {
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_URL,
  SUPPORT_WHATSAPP_DISPLAY,
  BUSINESS_HOURS,
} from "@/lib/support";
import { collectDiagnostics, formatDiagnostics } from "@/lib/diagnostics";

export default function SupportPage() {
  return (
    <RequireAdmin>
      <Support />
    </RequireAdmin>
  );
}

function Support() {
  const { user } = useUser();
  const [copied, setCopied] = useState(false);

  const userId = user?.id ?? null;
  // "Company ID" is read from Clerk public metadata when present (companyId or
  // the QuickBooks realm id); otherwise the diagnostics show "Not available".
  const companyId = useMemo(() => {
    const meta = user?.publicMetadata as
      | { companyId?: string; realmId?: string; qboRealmId?: string }
      | undefined;
    return meta?.companyId ?? meta?.realmId ?? meta?.qboRealmId ?? null;
  }, [user?.publicMetadata]);

  // Snapshot for display; the copy/email actions recompute to pick up a tid
  // recorded after the page loaded.
  const diagnosticsText = useMemo(
    () => formatDiagnostics(collectDiagnostics({ userId, companyId })),
    [userId, companyId],
  );

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("AddisDispatch support request");
    const body = encodeURIComponent(
      "Describe the issue you're seeing:\n\n\n" +
        "-----------------------------\n" +
        formatDiagnostics(collectDiagnostics({ userId, companyId })),
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [userId, companyId]);

  async function copyDiagnostics() {
    const text = formatDiagnostics(collectDiagnostics({ userId, companyId }));
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl p-5 lg:p-8">
      <header className="mb-8 flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent/15 text-accentDeep">
          <LifeBuoy size={22} />
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Help &amp; Support
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Reach our team, or copy your diagnostic information to speed up
            troubleshooting.
          </p>
        </div>
      </header>

      {/* Contact channels */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact us
        </h2>
        <dl className="mt-4 space-y-4">
          <ContactRow icon={<Mail size={18} />} label="Support email">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accentDeep hover:underline">
              {SUPPORT_EMAIL}
            </a>
          </ContactRow>
          <ContactRow icon={<MessageCircle size={18} />} label="WhatsApp">
            <a
              href={SUPPORT_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accentDeep hover:underline"
            >
              {SUPPORT_WHATSAPP_DISPLAY}
            </a>
          </ContactRow>
          <ContactRow icon={<Clock size={18} />} label="Business hours">
            <span className="text-foreground">{BUSINESS_HOURS}</span>
          </ContactRow>
        </dl>

        <a
          href={mailtoHref}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-[#1a1712] shadow-soft transition-colors hover:bg-accentDeep hover:text-white"
        >
          <Mail size={16} />
          Contact Support
        </a>
      </section>

      {/* Diagnostics */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Diagnostic information
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Include this when you contact us — it helps us find your account
              and recent activity faster.
            </p>
          </div>
          <button
            type="button"
            onClick={copyDiagnostics}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:bg-muted"
            aria-live="polite"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy diagnostic information"}
          </button>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-xl border border-border bg-muted/50 p-4 text-xs leading-relaxed text-foreground">
          {diagnosticsText}
        </pre>
      </section>
    </main>
  );
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
          {label}
        </dt>
        <dd className="text-sm">{children}</dd>
      </div>
    </div>
  );
}
