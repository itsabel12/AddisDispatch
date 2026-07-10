"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  approveCarrierAccount,
  getCarrierAccounts,
  rejectCarrierAccount,
  type CarrierAccount,
} from "@/lib/api";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function AdminCarrierAccounts() {
  const { getToken } = useAuth();
  const [accounts, setAccounts] = useState<CarrierAccount[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await getCarrierAccounts(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load carrier accounts.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function approve(userId: string) {
    const newName = (names[userId] ?? "").trim();
    if (!newName) {
      setError("Enter a carrier name to approve this sign-up.");
      return;
    }
    setBusy(userId);
    setError(null);
    try {
      await approveCarrierAccount(await getToken(), userId, { new_carrier_name: newName });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approve failed.");
    } finally {
      setBusy(null);
    }
  }

  async function reject(userId: string) {
    setBusy(userId);
    setError(null);
    try {
      await rejectCarrierAccount(await getToken(), userId);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reject failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-5 lg:p-8">
      <PageHeader
        title="Carrier Accounts"
        subtitle="Review carrier sign-ups. Approving one creates a carrier record and grants that login access to its own loads and settlements."
      />

      {error && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  {loading ? "Loading…" : "No carrier sign-ups yet."}
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((a) => (
                <TableRow key={a.user_id}>
                  <TableCell>{a.email ?? "—"}</TableCell>
                  <TableCell>{a.name ?? "—"}</TableCell>
                  <TableCell className="capitalize">{a.status}</TableCell>
                  <TableCell>{a.carrier_name ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {a.status === "approved" ? (
                      <button
                        type="button"
                        disabled={busy === a.user_id}
                        onClick={() => reject(a.user_id)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                      >
                        Revoke
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          value={names[a.user_id] ?? ""}
                          onChange={(e) =>
                            setNames((prev) => ({ ...prev, [a.user_id]: e.target.value }))
                          }
                          placeholder="Carrier name"
                          className="w-40 rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-ring"
                        />
                        <button
                          type="button"
                          disabled={busy === a.user_id}
                          onClick={() => approve(a.user_id)}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busy === a.user_id}
                          onClick={() => reject(a.user_id)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
