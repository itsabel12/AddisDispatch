import { RequireAdmin } from "@/components/require-admin";
import { Inbox } from "@/components/admin/Inbox";

export default function InboxPage() {
  return (
    <RequireAdmin>
      <Inbox />
    </RequireAdmin>
  );
}
