import { RequireCarrier } from "@/components/require-carrier";
import { CarrierProfile } from "@/components/carrier/CarrierProfile";

export default function CarrierProfilePage() {
  return (
    <RequireCarrier>
      <CarrierProfile />
    </RequireCarrier>
  );
}
