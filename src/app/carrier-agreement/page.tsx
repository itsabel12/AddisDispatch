import type { Metadata } from "next";
import LegalPageShell from "@/components/legal/LegalPageShell";
import CarrierAgreement, {
  CARRIER_AGREEMENT_LAST_UPDATED,
} from "@/components/legal/CarrierAgreement";

export const metadata: Metadata = {
  title: "Carrier Agreement",
  description:
    "The dispatch service terms carriers agree to when running with AddisDispatch.",
  alternates: { canonical: "https://addisdispatch.com/carrier-agreement" },
};

export default function CarrierAgreementPage() {
  return (
    <LegalPageShell
      title="Carrier Agreement"
      lastUpdated={CARRIER_AGREEMENT_LAST_UPDATED}
    >
      <CarrierAgreement />
    </LegalPageShell>
  );
}
