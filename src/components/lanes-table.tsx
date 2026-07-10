"use client";

/**
 * Read-only lane analytics table. Data comes from GET /lanes (already sorted by
 * best average rpm first).
 */

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLanes, type LaneStat } from "@/lib/api";

const COLS = 4;

function money(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function LanesTable() {
  const { getToken } = useAuth();
  const [lanes, setLanes] = useState<LaneStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setError(null);
      const token = await getToken();
      setLanes(await getLanes(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 p-3 text-sm text-danger">
          Could not load data: {error}. Is the backend running on{" "}
          <code className="rounded bg-muted px-1">http://localhost:8000</code>?
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lane</TableHead>
              <TableHead>Loads</TableHead>
              <TableHead>Avg RPM</TableHead>
              <TableHead>Avg Rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center">
                  Loading…
                </TableCell>
              </TableRow>
            ) : lanes.length ? (
              lanes.map((lane) => (
                <TableRow key={`${lane.origin}->${lane.destination}`}>
                  <TableCell className="font-medium">
                    {lane.origin} → {lane.destination}
                  </TableCell>
                  <TableCell>{lane.load_count}</TableCell>
                  <TableCell>
                    {lane.avg_rpm === null ? "—" : `$${lane.avg_rpm.toFixed(2)}`}
                  </TableCell>
                  <TableCell>{money(lane.avg_rate)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLS} className="h-24 text-center">
                  No lanes yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
