"use client";

import type { LegalModal } from "@/lib/overlay";
import ModalShell from "./ModalShell";

type Props = {
  modal: LegalModal;
  onClose: () => void;
};

export default function LegalModalView({ modal, onClose }: Props) {
  return (
    <ModalShell onClose={onClose} className="max-w-2xl">
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        {modal === "privacy" ? <Privacy /> : <Terms />}
      </div>
    </ModalShell>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mt-6 font-display text-base font-semibold text-ink">{children}</h3>;
}

function Body({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-sm font-light leading-relaxed text-inkMuted">{children}</p>;
}

function Privacy() {
  return (
    <div>
      <h2 className="pr-10 font-display text-2xl font-bold text-ink">Privacy Policy</h2>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
        Effective: June 1, 2026
      </div>
      <Body>
        AddisDispatch is committed to protecting the privacy of carriers and visitors
        who interact with our website.
      </Body>

      <H3>1. Information We Collect</H3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-light text-inkMuted">
        <li>Full name, phone, and email</li>
        <li>MC number and USDOT number</li>
        <li>Equipment type, fleet size, preferred lanes</li>
      </ul>

      <H3>2. How We Use It</H3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-light text-inkMuted">
        <li>To contact you about dispatch services</li>
        <li>To set up your carrier profile with vetted brokers</li>
        <li>To communicate load opportunities and dispatch updates</li>
      </ul>

      <H3>3. Sharing</H3>
      <Body>
        We do not sell or rent your data. It is shared only with brokers as required to
        perform dispatch services.
      </Body>

      <H3>4. Your Rights</H3>
      <Body>
        Request access, correction, or deletion at{" "}
        <strong className="text-ink">privacy@addisdispatch.com</strong>.
      </Body>

      <div className="mt-6 rounded-xl border border-line bg-elevated/60 p-4 text-xs font-light text-inkMuted">
        AddisDispatch complies with applicable U.S. federal and state privacy laws.
      </div>
    </div>
  );
}

function Terms() {
  return (
    <div>
      <h2 className="pr-10 font-display text-2xl font-bold text-ink">Terms of Service</h2>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-accent">
        Effective: June 1, 2026 · Governing Law: Texas
      </div>
      <Body>
        These Terms govern the relationship between AddisDispatch (&quot;Dispatcher&quot;)
        and the carrier who engages our services.
      </Body>

      <H3>1. Nature of Service</H3>
      <Body>
        AddisDispatch is a dispatch service, NOT a licensed freight broker. We act as
        agent on behalf of the Carrier.
      </Body>

      <H3>2. Carrier Obligations</H3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-light text-inkMuted">
        <li>Valid MC authority and USDOT registration</li>
        <li>Minimum liability insurance of $1,000,000</li>
        <li>Honor all rate confirmations made on your behalf</li>
      </ul>

      <H3>3. Fees</H3>
      <Body>
        6–8% of gross load rate based on your plan. Invoiced weekly, due within 7
        business days.
      </Body>

      <H3>4. Termination</H3>
      <Body>
        Either party may terminate with 30 days&apos; written notice. All outstanding
        fees remain due.
      </Body>

      <div className="mt-6 rounded-xl border border-line bg-elevated/60 p-4 text-xs font-light text-inkMuted">
        Questions? Contact legal@addisdispatch.com
      </div>
    </div>
  );
}
