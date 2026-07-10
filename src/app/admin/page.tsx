/**
 * Loads page (home route). Auth-gated via <RequireAdmin>; signed-in users see
 * the loads table.
 */

import { RequireAdmin } from "@/components/require-admin";
import { LoadsTable } from "@/components/loads-table";
import { PageHeader } from "@/components/ui/page-header";

export default function LoadsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <RequireAdmin>
        <PageHeader
          title="Loads"
          subtitle="Board loads, scored and ranked for booking."
        />
        <LoadsTable />
      </RequireAdmin>
    </main>
  );
}
