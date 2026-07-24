"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

import { RequireAdmin } from "@/components/require-admin";
import {
  LifeBuoy,
  Mail,
  MessageCircle,
  Phone,
  Clock,
  Copy,
  Check,
} from "@/components/icons";
import {
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
  SUPPORT_WHATSAPP_URL,
  SUPPORT_WHATSAPP_DISPLAY,
  BUSINESS_HOURS,
} from "@/lib/support";
import { collectDiagnostics, formatDiagnostics } from "@/lib/diagnostics";
import { getQuickBooksStatus } from "@/lib/api";

// Human-readable tail for each callback error reason (see routers/quickbooks.py).
const QB_ERROR_REASONS: Record<string, string> = {
  state: " — the connection link expired",
  exchange: " — QuickBooks declined the authorization",
  unconfigured: " — the integration isn't configured on the server",
};

export default function SupportPage() {
  return (
    <RequireAdmin>
      <Support />
    </RequireAdmin>
  );
}

function Support() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [copied, setCopied] = useState(false);

  const userId = user?.id ?? null;

  // QuickBooks connection state + Realm ID, fetched from the connected company.
  // If the integration isn't connected / enabled, these stay false/null.
  const [realmId, setRealmId] = useState<string | null>(null);
  const [qbConnected, setQbConnected] = useState(false);
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const status = await getQuickBooksStatus(await getToken());
        if (!active) return;
        setQbConnected(status.connected);
        setRealmId(status.connected ? status.realm_id ?? null : null);
      } catch {
        if (active) {
          setQbConnected(false);
          setRealmId(null);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [getToken]);

  // Result of the QuickBooks OAuth callback, which 303-redirects the browser
  // back here with ?quickbooks=connected | error&reason=…. Read from the URL
  // once on mount (via window.location so we don't need a Suspense boundary),
  // then stripped from the address bar so a refresh doesn't re-show it.
  const [qbNotice, setQbNotice] = useState<
    { type: "connected" | "error"; reason?: string } | null
  >(null);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get("quickbooks");
    if (outcome !== "connected" && outcome !== "error") return;
    // One-time read of the OAuth callback result from the URL on mount — a
    // legitimate external-system sync, not a render-derived value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQbNotice({ type: outcome, reason: params.get("reason") ?? undefined });
    params.delete("quickbooks");
    params.delete("reason");
    const qs = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? `?${qs}` : ""));
  }, []);

  // Internal company id from Clerk public metadata (shown alongside the Realm ID).
  const internalCompanyId = useMemo(() => {
    const meta = user?.publicMetadata as { companyId?: string } | undefined;
    return meta?.companyId ?? null;
  }, [user?.publicMetadata]);

  const buildDiagnostics = () =>
    formatDiagnostics(
      collectDiagnostics({
        userId,
        realmId,
        internalCompanyId,
        quickbooksConnected: qbConnected,
      }),
    );

  // Computed after mount (client-only) so browser detection + cached tid are
  // present without causing an SSR/hydration mismatch (starts empty on both).
  const [diagnosticsText, setDiagnosticsText] = useState("Collecting diagnostics…");
  useEffect(() => {
    setDiagnosticsText(buildDiagnostics());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, realmId, internalCompanyId, qbConnected]);

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent("AddisDispatch support request");
    const body = encodeURIComponent(
      "Describe the issue you're seeing:\n\n\n" +
        "-----------------------------\n" +
        diagnosticsText,
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }, [diagnosticsText]);

  async function copyDiagnostics() {
    // Recompute fresh to capture a tid recorded after the last render.
    const text = buildDiagnostics();
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

      {qbNotice && (
        <div
          role="status"
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            qbNotice.type === "connected"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/30 bg-red-500/10 text-red-200"
          }`}
        >
          {qbNotice.type === "connected"
            ? "QuickBooks connected successfully."
            : `Couldn't connect QuickBooks${
                QB_ERROR_REASONS[qbNotice.reason ?? ""] ?? ""
              }. Please try connecting again.`}
        </div>
      )}

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
          <ContactRow icon={<Phone size={18} />} label="Phone">
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="text-accentDeep hover:underline">
              {SUPPORT_PHONE_DISPLAY}
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
            {copied ? "Copied" : "Copy Diagnostics"}
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
