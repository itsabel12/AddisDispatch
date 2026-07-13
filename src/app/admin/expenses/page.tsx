/**
 * Expenses page. Auth-gated; record and review operating overhead (insurance,
 * software, factoring fees, …) that feeds the company net-profit P&L.
 */

import { RequireAdmin } from "@/components/require-admin";
import { Expenses } from "@/components/admin/Expenses";

export default function ExpensesPage() {
  return (
    <RequireAdmin>
      <Expenses />
    </RequireAdmin>
  );
}
