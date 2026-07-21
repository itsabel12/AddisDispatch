import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import PrivacyPolicy, { PRIVACY_LAST_UPDATED } from "@/components/legal/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How AddisDispatch collects, uses, and protects the information of carriers and website visitors.",
  alternates: { canonical: "https://addisdispatch.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={PRIVACY_LAST_UPDATED}>
      <PrivacyPolicy />
    </LegalPageShell>
  );
}
