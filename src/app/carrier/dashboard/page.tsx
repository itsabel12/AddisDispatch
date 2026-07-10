import { RequireCarrier } from "@/components/require-carrier";
import { CarrierDashboard } from "@/components/carrier/CarrierDashboard";

export default function CarrierDashboardPage() {
  return (
    <RequireCarrier>
      <CarrierDashboard />
    </RequireCarrier>
  );
}
