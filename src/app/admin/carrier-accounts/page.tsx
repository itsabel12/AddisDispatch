import { RequireAdmin } from "@/components/require-admin";
import { AdminCarrierAccounts } from "@/components/admin/CarrierAccounts";

export default function CarrierAccountsPage() {
  return (
    <RequireAdmin>
      <AdminCarrierAccounts />
    </RequireAdmin>
  );
}
