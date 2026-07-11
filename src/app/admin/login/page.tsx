"use client";

import { SignIn, SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { clerkAppearance } from "@/lib/clerk-appearance";
import { TruckMark } from "@/components/Logo";

/**
 * AuthShell — premium split sign-in card: a dark brand panel (echoing the
 * AddisDispatch identity) beside a light form panel on the warm canvas.
 */
function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="portal-rise grid w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-card shadow-card md:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#211c16] p-9 text-white md:flex">
        <div
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(239,127,24,0.55), transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2.5 text-white">
          <TruckMark size={34} />
          <span className="font-heading text-lg font-semibold tracking-tight">
            Addis<span className="text-accent">Dispatch</span>
          </span>
        </div>
        <div className="relative">
          <h2 className="font-heading text-2xl font-semibold leading-snug tracking-tight">
            Dispatch, engineered by data.
          </h2>
          <p className="mt-2 max-w-xs text-sm text-white/60">
            The command center for loads, carriers, invoicing, and payroll — one
            operational cockpit.
          </p>
        </div>
        <p className="relative text-xs text-white/40">Internal operations · Authorized dispatchers only</p>
      </div>

      {/* Form panel */}
      <div className="p-8 sm:p-9">
        <div className="mb-6 flex items-center gap-2.5 text-foreground md:hidden">
          <TruckMark size={28} />
          <span className="font-heading text-base font-semibold tracking-tight">
            Addis<span className="text-accentDeep">Dispatch</span>
          </span>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Dispatcher Login
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to the AddisDispatch command center.
        </p>
        <div className="mt-6">{children}</div>
        <p className="mt-6 text-xs text-muted-foreground">
          Are you a carrier?{" "}
          <Link href="/carrier/login" className="font-medium text-accentDeep hover:underline">
            Carrier Login →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [wrongRole, setWrongRole] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const role = (user.publicMetadata as { role?: string })?.role;
    if (role === "admin" || role === "dispatcher") {
      router.replace("/admin/dashboard");
    } else {
      setWrongRole(true);
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <AuthShell>
        <p className="text-sm text-muted-foreground">Connecting…</p>
      </AuthShell>
    );
  }

  if (isSignedIn && wrongRole) {
    return (
      <AuthShell>
        <div className="rounded-xl border border-danger/25 bg-danger/5 p-5">
          <p className="text-sm font-semibold text-danger">Wrong portal</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            This login is for dispatchers only. Please use the{" "}
            <Link href="/carrier/login" className="font-medium text-accentDeep hover:underline">
              Carrier Login
            </Link>
            .
          </p>
          <div className="mt-4">
            <SignOutButton>
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </AuthShell>
    );
  }

  if (isSignedIn) {
    return (
      <AuthShell>
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <SignIn
        routing="hash"
        appearance={clerkAppearance}
        fallbackRedirectUrl="/admin/dashboard"
        signUpFallbackRedirectUrl="/admin/dashboard"
      />
    </AuthShell>
  );
}
