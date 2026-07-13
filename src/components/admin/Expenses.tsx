"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getExpenses,
  createExpense,
  deleteExpense,
  EXPENSE_CATEGORIES,
  type ExpenseInput,
} from "@/lib/api";
import { useQuery } from "@/lib/useQuery";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash } from "@/components/icons";

const COLS = 6;

const money = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD" });

const formatDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm = (): ExpenseInput => ({
  incurred_on: todayISO(),
  category: "software",
  description: "",
  amount: 0,
  vendor: "",
  recurring: false,
});

export function Expenses() {
  const { getToken } = useAuth();
  const { data, loading, error, refetch } = useQuery(getExpenses, {
    fallbackError: "Failed to load expenses.",
  });
  const expenses = data ?? [];

  const [form, setForm] = useState<ExpenseInput>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!form.description.trim() || !(form.amount > 0)) {
      setFormError("Enter a description and a positive amount.");
      return;
    }
    setSaving(true);
    try {
      await createExpense(await getToken(), {
        ...form,
        description: form.description.trim(),
        vendor: form.vendor?.trim() || null,
      });
      setForm(emptyForm());
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save the expense.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    setBusyId(id);
    setFormError(null);
    try {
      await deleteExpense(await getToken(), id);
      await refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not delete the expense.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl p-5 lg:p-8">
      <PageHeader
        title="Operating Expenses"
        subtitle="Overhead that isn't tied to a single load — insurance, software, factoring fees. These are subtracted from gross profit to show your true net profit on the Profitability dashboard."
      />

      {(formError || error) && (
        <p className="mb-6 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {formError ?? error}
        </p>
      )}

      {/* Add expense */}
      <form
        onSubmit={submit}
        className="mb-8 grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-12"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
          Date
          <input
            type="date"
            value={form.incurred_on}
            max={todayISO()}
            onChange={(e) => setForm({ ...form, incurred_on: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
          Category
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as ExpenseInput["category"] })
            }
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-4">
          Description
          <input
            type="text"
            value={form.description}
            maxLength={200}
            placeholder="e.g. Monthly TMS subscription"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground lg:col-span-2">
          Amount
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount || ""}
            placeholder="0.00"
            onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            required
          />
        </label>
        <div className="flex items-end lg:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="h-9 w-full rounded-lg bg-accent px-4 text-sm font-semibold text-[#1a1712] shadow-soft transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Adding…" : "Add expense"}
          </button>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground lg:col-span-4">
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
          />
          Recurring monthly cost
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground sm:col-span-1 lg:col-span-4">
          Vendor (optional)
          <input
            type="text"
            value={form.vendor ?? ""}
            maxLength={120}
            placeholder="e.g. Progressive, QuickBooks"
            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
          />
        </label>
      </form>

      {/* Expense list */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Recorded expenses</h2>
          <span className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{money(total)}</span>
          </span>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : expenses.length ? (
              expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatDate(e.incurred_on)}
                  </TableCell>
                  <TableCell className="capitalize">{e.category}</TableCell>
                  <TableCell className="font-medium">
                    {e.description}
                    {e.recurring && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        recurring
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.vendor ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(e.amount)}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      disabled={busyId === e.id}
                      aria-label={`Delete ${e.description}`}
                      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger disabled:opacity-40"
                    >
                      <Trash size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center text-muted-foreground">
                  No expenses recorded yet. Add your overhead above to see true net profit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
