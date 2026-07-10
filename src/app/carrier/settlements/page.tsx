import { RequireCarrier } from "@/components/require-carrier";
import { CarrierSettlements } from "@/components/carrier/CarrierSettlements";

export default function CarrierSettlementsPage() {
  return (
    <RequireCarrier>
      <CarrierSettlements />
    </RequireCarrier>
  );
}
