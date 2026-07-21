/**
 * Privacy Policy — single source of truth.
 *
 * Content moved verbatim from the former Privacy legal modal
 * (components/overlays/LegalModal.tsx) so it now lives at a stable, publicly
 * accessible URL (/privacy). Rendered by app/privacy/page.tsx.
 */
import { H2, P, UL, Callout } from "./prose";

// The document's own stated effective/last-updated date.
export const PRIVACY_LAST_UPDATED = "June 1, 2026";

export default function PrivacyPolicy() {
  return (
    <>
      <P>
        AddisDispatch is committed to protecting the privacy of carriers and visitors
        who interact with our website.
      </P>

      <H2>1. Information We Collect</H2>
      <UL>
        <li>Full name, phone, and email</li>
        <li>MC number and USDOT number</li>
        <li>Equipment type, fleet size, preferred lanes</li>
      </UL>

      <H2>2. How We Use It</H2>
      <UL>
        <li>To contact you about dispatch services</li>
        <li>To set up your carrier profile with vetted brokers</li>
        <li>To communicate load opportunities and dispatch updates</li>
      </UL>

      <H2>3. Sharing</H2>
      <P>
        We do not sell or rent your data. It is shared only with brokers as required to
        perform dispatch services.
      </P>

      <H2>4. Your Rights</H2>
      <P>
        Request access, correction, or deletion at{" "}
        <strong className="font-medium text-ink">privacy@addisdispatch.com</strong>.
      </P>

      <Callout>
        AddisDispatch complies with applicable U.S. federal and state privacy laws.
      </Callout>
    </>
  );
}
