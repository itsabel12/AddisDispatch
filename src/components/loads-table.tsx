"use client";

/**
 * The loads table. Rendered only for signed-in users (see page.tsx).
 *
 * It reads the Clerk session token via useAuth().getToken() and passes it to
 * the backend, which verifies it before returning data.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import {
  deleteLoad,
  getLoads,
  importTruckstopCsv,
  rescoreLoads,
  type Load,
} from "@/lib/api";
import { NewLoadForm } from "@/components/new-load-form";
import { LoadDrawer } from "@/components/admin/LoadDrawer";
import { useToast, useConfirm } from "@/components/admin/feedback";

/** Handlers passed to the table so the actions column can call them. */
type LoadsTableMeta = {
  onView: (load: Load) => void;
  onEdit: (load: Load) => void;
  onDelete: (load: Load) => void;
};

/** Format a numeric rate as US currency, or a dash when missing. */
function formatRate(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/** Format rate-per-mile as e.g. "$2.53", or a dash when missing. */
function formatRpm(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return `$${value.toFixed(2)}`;
}

/** Tailwind classes for the recommendation badge, keyed off the text. */
function recBadgeClass(rec: string | null): string {
  const base = "inline-block rounded px-2 py-0.5 text-xs font-medium ";
  if (!rec) return base + "bg-gray-100 text-gray-600";
  if (rec === "Book") return base + "bg-green-100 text-green-800";
  if (rec === "Consider") return base + "bg-amber-100 text-amber-800";
  if (rec.startsWith("Pass")) return base + "bg-red-100 text-red-800";
  if (rec.startsWith("Call")) return base + "bg-blue-100 text-blue-800";
  return base + "bg-gray-100 text-gray-700"; // "Review …" / anything else
}

/** Bucket a recommendation into a coarse category for the filter chips. */
function recCategory(
  rec: string | null,
): "Book" | "Consider" | "Pass" | "Call" | "Other" {
  if (rec === "Book") return "Book";
  if (rec === "Consider") return "Consider";
  if (rec?.startsWith("Pass")) return "Pass";
  if (rec?.startsWith("Call")) return "Call";
  return "Other";
}

const FILTER_CHIPS = ["All", "Book", "Consider", "Pass", "Call"] as const;
type FilterValue = (typeof FILTER_CHIPS)[number];

/** Column definitions for the loads table. */
const columns: ColumnDef<Load>[] = [
  { id: "broker", header: "Broker", accessorKey: "broker_name" },
  {
    id: "origin",
    header: "Origin",
    accessorFn: (row) => `${row.origin_city}, ${row.origin_state}`,
  },
  {
    id: "destination",
    header: "Destination",
    accessorFn: (row) => `${row.dest_city}, ${row.dest_state}`,
  },
  {
    id: "rate",
    header: "Rate",
    accessorKey: "rate",
    cell: ({ getValue }) => formatRate(getValue<number | null>()),
  },
  {
    id: "rpm",
    header: "RPM",
    accessorKey: "rpm",
    cell: ({ getValue }) => formatRpm(getValue<number | null>()),
  },
  {
    id: "miles",
    header: "Miles",
    accessorKey: "loaded_miles",
    cell: ({ getValue }) => getValue<number | null>() ?? "—",
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
  },
  {
    id: "score",
    header: "Score",
    accessorKey: "score",
    // Treat a missing score as -1 so unscored loads sort to the bottom.
    sortingFn: (a, b) =>
      (a.getValue<number | null>("score") ?? -1) -
      (b.getValue<number | null>("score") ?? -1),
    cell: ({ getValue }) => {
      const v = getValue<number | null>();
      return v === null || v === undefined ? (
        "—"
      ) : (
        <span className="font-semibold">{v}</span>
      );
    },
  },
  {
    id: "recommendation",
    header: "Recommendation",
    accessorKey: "recommendation",
    cell: ({ getValue }) => {
      const rec = getValue<string | null>();
      return <span className={recBadgeClass(rec)}>{rec ?? "—"}</span>;
    },
  },
  {
    id: "carrier",
    header: "Carrier",
    accessorKey: "carrier_name",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as LoadsTableMeta;
      return (
        <div className="flex gap-3">
          <button
            type="button"
            className="text-xs font-medium text-accentDeep hover:underline"
            onClick={() => meta.onView(row.original)}
          >
            View
          </button>
          <button
            type="button"
            className="text-xs font-medium text-accentDeep hover:underline"
            onClick={() => meta.onEdit(row.original)}
          >
            Edit
          </button>
          <button
            type="button"
            className="text-xs font-medium text-danger hover:underline"
            onClick={() => meta.onDelete(row.original)}
          >
            Delete
          </button>
        </div>
      );
    },
  },
];

export function LoadsTable() {
  const { getToken } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const searchParams = useSearchParams();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerLoad, setDrawerLoad] = useState<Load | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      // Clerk's session token (a JWT). The backend verifies its signature.
      const token = await getToken();
      const data = await getLoads(token);
      setLoads(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Deep-link from ⌘K record search: /admin?load=<id> opens that load's drawer.
  useEffect(() => {
    const id = searchParams.get("load");
    if (id && loads.length) {
      const match = loads.find((l) => l.id === id);
      if (match) setDrawerLoad(match);
    }
  }, [searchParams, loads]);

  // Add/edit form: formOpen + which load is being edited (null = creating).
  const [formOpen, setFormOpen] = useState(false);
  const [editingLoad, setEditingLoad] = useState<Load | null>(null);
  const openCreate = () => {
    setEditingLoad(null);
    setFormOpen(true);
  };
  const openEdit = (load: Load) => {
    setEditingLoad(load);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingLoad(null);
  };

  // Import CSV / Re-score / Delete actions.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleDelete(load: Load) {
    const lane = `${load.origin_city}, ${load.origin_state} → ${load.dest_city}, ${load.dest_state}`;
    const ok = await confirm({
      title: "Delete this load?",
      body: `${load.broker_name} — ${lane}`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      const token = await getToken();
      await deleteLoad(token, load.id);
      toast.success("Load deleted.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be picked again later
    if (!file) return;
    setBusy(true);
    try {
      const token = await getToken();
      const r = await importTruckstopCsv(token, file);
      const extras = [
        r.duplicates ? `${r.duplicates} duplicate` : null,
        r.skipped ? `${r.skipped} skipped` : null,
      ].filter(Boolean);
      toast.success(
        `Imported ${r.imported} load(s)` +
          (extras.length ? ` (${extras.join(", ")}).` : "."),
      );
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRescore() {
    setBusy(true);
    try {
      const token = await getToken();
      const r = await rescoreLoads(token);
      toast.success(`Re-scored ${r.scored} load(s).`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Re-score failed");
    } finally {
      setBusy(false);
    }
  }

  // Default to highest score first; headers are clickable to re-sort.
  const [sorting, setSorting] = useState<SortingState>([
    { id: "score", desc: true },
  ]);

  // Recommendation filter chips.
  const [filter, setFilter] = useState<FilterValue>("All");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: loads.length };
    for (const l of loads) {
      const cat = recCategory(l.recommendation);
      c[cat] = (c[cat] ?? 0) + 1;
    }
    return c;
  }, [loads]);

  const visibleLoads = useMemo(
    () =>
      filter === "All"
        ? loads
        : loads.filter((l) => recCategory(l.recommendation) === filter),
    [loads, filter],
  );

  const table = useReactTable({
    data: visibleLoads,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    meta: {
      onView: setDrawerLoad,
      onEdit: openEdit,
      onDelete: handleDelete,
    } satisfies LoadsTableMeta,
  });

  const columnCount = useMemo(() => columns.length, []);

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 p-3 text-sm text-danger">
          Could not load data: {error}. Is the backend running on{" "}
          <code className="rounded bg-muted px-1">http://localhost:8000</code>?
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTER_CHIPS.map((chip) => {
            const active = filter === chip;
            const label = chip === "Call" ? "Call broker" : chip;
            return (
              <button
                key={chip}
                type="button"
                onClick={() => setFilter(chip)}
                className={
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors " +
                  (active
                    ? "border-transparent bg-accent font-semibold text-[#1a1712] shadow-soft"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground")
                }
              >
                {label} ({counts[chip] ?? 0})
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleImport}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            Import CSV
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleRescore}
            className="rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {busy ? "Working…" : "Re-score"}
          </button>
          <button
            type="button"
            onClick={() =>
              formOpen && !editingLoad ? closeForm() : openCreate()
            }
            className="rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-black shadow-soft transition-colors hover:bg-accentDeep"
          >
            {formOpen && !editingLoad ? "Close" : "+ Add load"}
          </button>
        </div>
      </div>

      {formOpen && (
        <NewLoadForm
          key={editingLoad?.id ?? "new"}
          initial={editingLoad}
          onSaved={() => {
            const wasEdit = Boolean(editingLoad);
            closeForm();
            toast.success(wasEdit ? "Load updated." : "Load created.");
            void reload();
          }}
          onCancel={closeForm}
        />
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={
                      header.column.getCanSort()
                        ? "cursor-pointer select-none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <span className="inline-flex items-center gap-1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{ asc: "▲", desc: "▼" }[
                          header.column.getIsSorted() as string
                        ] ?? null}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  No loads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <LoadDrawer load={drawerLoad} onClose={() => setDrawerLoad(null)} />
    </>
  );
}
