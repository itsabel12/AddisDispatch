import { RequireAdmin } from "@/components/require-admin";
import { CommandCenter } from "@/components/admin/CommandCenter";

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <CommandCenter />
    </RequireAdmin>
  );
}
