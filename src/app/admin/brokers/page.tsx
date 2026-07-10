/**
 * Brokers page. Auth-gated; lists brokers with their load counts and lets you
 * edit contact info or delete a broker.
 */

import { RequireAdmin } from "@/components/require-admin";
import { BrokersTable } from "@/components/brokers-table";
import { PageHeader } from "@/components/ui/page-header";

export default function BrokersPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <RequireAdmin>
        <PageHeader
          title="Brokers"
          subtitle="Brokers from your loads. Add contact details and notes here."
        />
        <BrokersTable />
      </RequireAdmin>
    </main>
  );
}
