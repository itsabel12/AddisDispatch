import { RequireAdmin } from "@/components/require-admin";
import { ProfitabilityDashboard } from "@/components/admin/ProfitabilityDashboard";

export default function ProfitabilityPage() {
  return (
    <RequireAdmin>
      <ProfitabilityDashboard />
    </RequireAdmin>
  );
}
