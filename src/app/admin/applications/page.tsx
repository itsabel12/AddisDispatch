import { RequireAdmin } from "@/components/require-admin";
import { Applications } from "@/components/admin/Applications";

export default function ApplicationsPage() {
  return (
    <RequireAdmin>
      <Applications />
    </RequireAdmin>
  );
}
