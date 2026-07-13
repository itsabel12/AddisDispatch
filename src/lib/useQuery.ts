"use client";

/**
 * useQuery — the portal's small data-fetching primitive.
 *
 * Every data view used to hand-roll the same block: `data/error/loading` state,
 * a `reload` callback, and `useEffect(() => void reload(), [reload])`. That last
 * line calls setState synchronously inside an effect (loading→true before the
 * first await), which cascades renders and trips react-hooks/set-state-in-effect.
 *
 * This hook centralizes the pattern once and gets it right:
 *  - the initial-load effect touches state ONLY after an `await`, so there is no
 *    synchronous setState in the effect body (rule-clean, no cascading render);
 *  - `refetch()` is for event handlers / polling — it may flip `loading` eagerly
 *    because it does not run inside an effect;
 *  - in-flight results are dropped after unmount, and a monotonically increasing
 *    request id means a slow earlier fetch can never overwrite a newer one.
 *
 * Auth is handled here: the fetcher receives a fresh Clerk token each call.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useQuery(getMyPay);
 *   const items = data ?? [];
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";

export interface QueryResult<T> {
  /** The last successful result, or `undefined` until the first load resolves. */
  data: T | undefined;
  /** Human-readable message from the most recent failure, else `null`. */
  error: string | null;
  /** True during the initial load and any in-flight refetch. */
  loading: boolean;
  /** Re-run the fetcher (e.g. after a mutation, or on an interval). */
  refetch: () => Promise<void>;
}

export function useQuery<T>(
  fetcher: (token: string | null) => Promise<T>,
  options: { fallbackError?: string } = {},
): QueryResult<T> {
  const { fallbackError = "Something went wrong. Please try again." } = options;
  const { getToken } = useAuth();

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the latest fetcher/getToken in refs so `refetch` has a stable identity
  // (callers pass inline arrow fetchers that change every render).
  const fetcherRef = useRef(fetcher);
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    fetcherRef.current = fetcher;
    getTokenRef.current = getToken;
  });

  // Track mount + request ordering so late/stale responses are ignored.
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const load = useCallback(async (showLoading: boolean) => {
    const requestId = ++requestIdRef.current;
    if (showLoading) setLoading(true);
    try {
      const token = await getTokenRef.current();
      const result = await fetcherRef.current(token);
      if (mountedRef.current && requestId === requestIdRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : fallbackError);
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [fallbackError]);

  // `refetch` runs from event handlers / intervals, so flipping `loading`
  // eagerly here is fine — it is not inside an effect's synchronous body.
  const refetch = useCallback(() => load(true), [load]);

  // Initial load. `load(false)` performs no synchronous setState — every update
  // happens after an `await`, so there is no cascading render. The lint rule is
  // conservative and can't see across the call boundary, so it's disabled here
  // (in this one audited primitive) rather than in every calling component.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
  }, [load]);

  return { data, error, loading, refetch };
}
