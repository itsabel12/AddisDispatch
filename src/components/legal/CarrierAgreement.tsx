/**
 * Carrier Agreement — single source of truth.
 *
 * NOTE FOR MAINTAINERS: the site never had a distinct "Carrier Agreement"
 * document. The old footer "Carrier Agreement" link opened the Terms of
 * Service modal. To give this Intuit-required stable URL (/carrier-agreement)
 * real, crawlable content, this page surfaces the carrier↔dispatcher clauses
 * that were previously shown there (verbatim from the Terms), plus the
 * placeholder banner below. Replace this with the full, legally reviewed
 * Carrier/Dispatch Service Agreement when it is available. Rendered by
 * app/carrier-agreement/page.tsx.
 */
import { H2, P, UL, Callout } from "./prose";

// No distinct effective date existed for this document; mirrors the Terms date.
export const CARRIER_AGREEMENT_LAST_UPDATED = "June 1, 2026";

export default function CarrierAgreement() {
  return (
    <>
      <div className="mb-8 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm font-light text-inkMuted">
        <strong className="font-semibold text-ink">Placeholder — pending final legal review.</strong>{" "}
        This page summarizes the dispatch service terms carriers agree to. The complete
        Carrier / Dispatch Service Agreement is provided and signed during onboarding.
      </div>

      <P>
        This Agreement governs the relationship between AddisDispatch
        (&quot;Dispatcher&quot;) and the carrier who engages our services (&quot;Carrier&quot;).
      </P>

      <H2>1. Nature of Service</H2>
      <P>
        AddisDispatch is a dispatch service, NOT a licensed freight broker. We act as
        agent on behalf of the Carrier.
      </P>

      <H2>2. Carrier Obligations</H2>
      <UL>
        <li>Valid MC authority and USDOT registration</li>
        <li>Minimum liability insurance</li>
        <li>Honor all rate confirmations made on your behalf</li>
      </UL>

      <H2>3. Fees</H2>
      <P>
        8–10% of gross load rate based on your plan. Invoiced weekly, due within 7
        business days.
      </P>

      <H2>4. Termination</H2>
      <P>
        Either party may terminate with 30 days&apos; written notice. All outstanding
        fees remain due.
      </P>

      <Callout>Questions? Email contact@addisdispatch.com</Callout>
    </>
  );
}
