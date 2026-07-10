import { RequireAdmin } from "@/components/require-admin";
import { Payroll } from "@/components/admin/Payroll";

export default function PayrollPage() {
  return (
    <RequireAdmin>
      <Payroll />
    </RequireAdmin>
  );
}
