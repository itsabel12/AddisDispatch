"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getMyCarrier,
  updateMyCarrier,
  type CarrierProfile as Profile,
} from "@/lib/carrier-api";

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
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await getMyCarrier(await getToken());
      setProfile(p);
      setEmail(p.contact_email ?? "");
      setPhone(p.contact_phone ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load your profile.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const p = await updateMyCarrier(await getToken(), {
        contact_email: email.trim() || null,
        contact_phone: phone.trim() || null,
      });
      setProfile(p);
      setMessage("Contact details saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">Company Profile</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Your carrier details on file. You can maintain your contact info here;
        for name/MC/DOT changes, contact your dispatcher.
      </p>

      {error && (
        <p className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && <p className="mb-4 text-sm text-success">{message}</p>}

      <div className="rounded-xl border border-border bg-card p-6">
        {loading || !profile ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : (
          <>
            <dl>
              <Row label="Carrier name" value={profile.name} />
              <Row label="MC number" value={profile.mc_number} />
              <Row label="DOT number" value={profile.dot_number} />
            </dl>

            <form onSubmit={onSave} className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Contact email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-muted-foreground">Contact phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accentDeep disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save contact details"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
