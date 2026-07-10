"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import { getMyCarrier, type CarrierProfile as Profile } from "@/lib/carrier-api";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-3 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

export function CarrierProfile() {
  const { getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProfile(await getMyCarrier(await getToken()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">Company Profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your carrier details on file. Contact your dispatcher to update them.
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        {loading || !profile ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <dl>
            <Row label="Carrier name" value={profile.name} />
            <Row label="MC number" value={profile.mc_number} />
            <Row label="DOT number" value={profile.dot_number} />
            <Row label="Contact email" value={profile.contact_email} />
            <Row label="Contact phone" value={profile.contact_phone} />
          </dl>
        )}
      </div>
    </main>
  );
}
