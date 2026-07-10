/**
 * Carriers page. Auth-gated; add carriers and assign them to loads (assignment
 * lives on the load form). Lists carriers with their assigned-load counts.
 */

import { RequireAdmin } from "@/components/require-admin";
import { CarriersTable } from "@/components/carriers-table";
import { PageHeader } from "@/components/ui/page-header";

export default function CarriersPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <RequireAdmin>
        <PageHeader
          title="Carriers"
          subtitle="Trucking companies you dispatch to. Add one, then assign it to a load."
        />
        <CarriersTable />
      </RequireAdmin>
    </main>
  );
}
