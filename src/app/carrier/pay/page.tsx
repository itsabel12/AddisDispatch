import { RequireCarrier } from "@/components/require-carrier";
import { CarrierPay } from "@/components/carrier/CarrierPay";

export default function CarrierPayPage() {
  return (
    <RequireCarrier>
      <CarrierPay />
    </RequireCarrier>
  );
}
