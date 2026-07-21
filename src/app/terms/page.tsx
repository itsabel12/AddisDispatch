import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import TermsOfService, {
  TERMS_LAST_UPDATED,
  TERMS_GOVERNING_LAW,
} from "@/components/legal/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing the dispatch service relationship between AddisDispatch and the carriers it serves.",
  alternates: { canonical: "https://addisdispatch.com/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Terms of Service"
      lastUpdated={TERMS_LAST_UPDATED}
      subheading={`Governing Law: ${TERMS_GOVERNING_LAW}`}
    >
      <TermsOfService />
    </LegalPageShell>
  );
}
