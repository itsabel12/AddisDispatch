/**
 * Shared typographic primitives for the public legal documents
 * (Privacy Policy, Terms of Service, Carrier Agreement).
 *
 * These are plain server components — no client-side JS — so the legal text
 * is present in the server-rendered HTML for crawlers and reviewers. Each
 * document (see ./PrivacyPolicy, ./TermsOfService, ./CarrierAgreement) is the
 * single source of truth for its content and is rendered by its route page.
 */
import type { ReactNode } from "react";

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 font-display text-xl font-semibold text-ink">{children}</h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-6 font-display text-base font-semibold text-ink">{children}</h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-[0.95rem] font-light leading-relaxed text-inkMuted">
      {children}
    </p>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] font-light leading-relaxed text-inkMuted">
      {children}
    </ul>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 rounded-xl border border-line bg-elevated/60 p-4 text-sm font-light text-inkMuted">
      {children}
    </div>
  );
}
