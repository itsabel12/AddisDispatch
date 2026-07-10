import { RequireAdmin } from "@/components/require-admin";
import { AdminMessages } from "@/components/admin/AdminMessages";

export default function MessagesPage() {
  return (
    <RequireAdmin>
      <AdminMessages />
    </RequireAdmin>
  );
}
