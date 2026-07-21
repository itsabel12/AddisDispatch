/**
 * Terms of Service — single source of truth.
 *
 * Content moved verbatim from the former Terms legal modal
 * (components/overlays/LegalModal.tsx) so it now lives at a stable, publicly
 * accessible URL (/terms). Rendered by app/terms/page.tsx.
 */
import { H2, P, UL, Callout } from "./prose";

// The document's own stated effective/last-updated date.
export const TERMS_LAST_UPDATED = "June 1, 2026";
// Governing law, shown in the page subheading (verbatim from the former modal).
export const TERMS_GOVERNING_LAW = "Texas";

export default function TermsOfService() {
  return (
    <>
      <P>
        These Terms govern the relationship between AddisDispatch (&quot;Dispatcher&quot;)
        and the carrier who engages our services.
      </P>

      <H2>1. Nature of Service</H2>
      <P>
        AddisDispatch is a dispatch service, NOT a licensed freight broker. We act as
        agent on behalf of the Carrier.
      </P>

      <H2>2. Carrier Obligations</H2>
      <UL>
        <li>Valid MC authority and USDOT registration</li>
        <li>Minimum liability insurance of $1,000,000</li>
        <li>Honor all rate confirmations made on your behalf</li>
      </UL>

      <H2>3. Fees</H2>
      <P>
        6–8% of gross load rate based on your plan. Invoiced weekly, due within 7
        business days.
      </P>

      <H2>4. Termination</H2>
      <P>
        Either party may terminate with 30 days&apos; written notice. All outstanding
        fees remain due.
      </P>

      <Callout>Questions? Contact legal@addisdispatch.com</Callout>
    </>
  );
}
