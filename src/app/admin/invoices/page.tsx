/**
 * Invoices page. Auth-gated; create invoices from loads and track their status
 * (draft / sent / paid).
 */

import { RequireAdmin } from "@/components/require-admin";
import { InvoicesTable } from "@/components/invoices-table";
import { PageHeader } from "@/components/ui/page-header";

export default function InvoicesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <RequireAdmin>
        <PageHeader
          title="Invoices"
          subtitle="Bill a load: create an invoice, then send it and track to paid."
        />
        <InvoicesTable />
      </RequireAdmin>
    </main>
  );
}
