"use client";

/**
 * Carrier gate. Renders children only for a signed-in, APPROVED carrier. New
 * sign-ups land in a "pending approval" state with no data access until an
 * admin approves them. UI defense-in-depth — the backend enforces the real
 * boundary (every /carrier route requires an approved carrier and scopes to
 * that carrier's own rows).
 *
 *  - loading    -> connecting message
 *  - signed out -> branded carrier sign-in / sign-up
 *  - admin      -> redirect hint to the admin console
 *  - pending    -> awaiting-approval screen
 *  - approved   -> children
 */

import { SignIn, SignOutButton, useAuth, useUser } from "@clerk/nextjs";

import { TruckMark } from "@/components/Logo";

function Shell({ subtitle, children }: { subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="flex items-center justify-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <TruckMark size={26} />
          Addis<span className="text-accent">Dispatch</span>
          <span className="ml-1 font-normal text-muted-foreground">Carrier Portal</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6 flex justify-center">{children}</div>
      </div>
    </div>
  );
}

type CarrierMeta = { role?: string; status?: string };

export function RequireCarrier({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <Shell subtitle="Carrier portal">
        <p className="text-sm text-muted-foreground">Connecting to the sign-in service…</p>
      </Shell>
    );
  }

  if (!isSignedIn) {
    return (
      <Shell subtitle="Sign in or create your carrier account.">
        <SignIn
          routing="hash"
          fallbackRedirectUrl="/carrier/dashboard"
          signUpFallbackRedirectUrl="/carrier/dashboard"
        />
      </Shell>
    );
  }

  const meta = (user?.publicMetadata as CarrierMeta | undefined) ?? {};

  if (meta.role === "admin") {
    return (
      <Shell subtitle="Carrier portal">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-foreground">You&apos;re signed in as an administrator.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Head to the{" "}
            <a href="/admin/login" className="text-accent hover:underline">
              dispatcher login
            </a>
            .
          </p>
        </div>
      </Shell>
    );
  }

  const approved = meta.role === "carrier" && meta.status === "approved";
  if (!approved) {
    return (
      <Shell subtitle="Carrier portal">
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm font-medium text-foreground">
            Your carrier account is awaiting approval
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks for signing up. An AddisDispatch dispatcher will review and activate
            your account shortly. You&apos;ll be able to see your loads and settlements
            once you&apos;re approved.
          </p>
          <div className="mt-4">
            <SignOutButton>
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </Shell>
    );
  }

  return <>{children}</>;
}
