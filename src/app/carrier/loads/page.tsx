import { RequireCarrier } from "@/components/require-carrier";
import { CarrierLoads } from "@/components/carrier/CarrierLoads";

export default function CarrierLoadsPage() {
  return (
    <RequireCarrier>
      <CarrierLoads />
    </RequireCarrier>
  );
}
