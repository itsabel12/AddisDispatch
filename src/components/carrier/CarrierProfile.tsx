"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

import {
  getMyCarrier,
  updateMyCarrier,
  type CarrierProfile as Profile,
} from "@/lib/carrier-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value || "—"}</dd>
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
    <main className="mx-auto w-full max-w-2xl p-5 lg:p-8">
      <PageHeader
        title="Company Profile"
        subtitle="Your carrier details on file. Maintain your contact info here; for name/MC/DOT changes, contact your dispatcher."
      />

      {error && (
        <p className="mb-4 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success">
          {message}
        </p>
      )}

      {loading || !profile ? (
        <Card>
          <CardContent>
            <p className="text-sm text-muted-foreground">Loading…</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Carrier details</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <dl className="divide-y divide-border">
                <Row label="Carrier name" value={profile.name} />
                <Row label="MC number" value={profile.mc_number} />
                <Row label="DOT number" value={profile.dot_number} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact details</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={onSave} className="space-y-4">
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Contact email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block font-medium text-foreground">Contact phone</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={fieldClass}
                  />
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#1a1712] shadow-soft transition-colors hover:bg-accentDeep disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save contact details"}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
