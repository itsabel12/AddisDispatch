import { RequireCarrier } from "@/components/require-carrier";
import { CarrierDocuments } from "@/components/carrier/CarrierDocuments";

export default function CarrierDocumentsPage() {
  return (
    <RequireCarrier>
      <CarrierDocuments />
    </RequireCarrier>
  );
}
