import { RequireCarrier } from "@/components/require-carrier";
import { CarrierDashboard } from "@/components/carrier/CarrierDashboard";

export default function CarrierHomePage() {
  return (
    <RequireCarrier>
      <CarrierDashboard />
    </RequireCarrier>
  );
}
