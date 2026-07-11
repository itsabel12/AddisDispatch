"use client";

import { SignIn, SignOutButton, useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { TruckMark } from "@/components/Logo";

type CarrierMeta = { role?: string; status?: string };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <p className="flex items-center justify-center gap-2 text-lg font-semibold tracking-tight text-foreground">
          <TruckMark size={26} />
          Addis<span className="text-accent">Dispatch</span>
          <span className="ml-1 font-normal text-muted-foreground">Carrier Portal</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Carrier Login</p>
        <div className="mt-6 flex justify-center">{children}</div>
        <p className="mt-6 text-xs text-muted-foreground">
          Are you a dispatcher?{" "}
          <Link href="/admin/login" className="text-accent hover:underline">
            Dispatcher Login →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function CarrierLoginPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [wrongRole, setWrongRole] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;
    const meta = (user.publicMetadata as CarrierMeta) ?? {};
    // Only an actual dispatcher (admin) is in the wrong portal here. A carrier —
    // whether approved or still pending approval — belongs in the carrier portal;
    // the dashboard's guard (RequireCarrier) shows the awaiting-approval screen for
    // pending sign-ups. Sending pending carriers to the "use the Dispatcher Login"
    // error was the bug.
    if (meta.role === "admin") {
      setWrongRole(true);
    } else {
      router.replace("/carrier/dashboard");
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Connecting…</p>
      </Shell>
    );
  }

  if (isSignedIn && wrongRole) {
    return (
      <Shell>
        <div className="w-full rounded-xl border border-border bg-card p-6 text-left">
          <p className="text-sm font-medium text-destructive">Wrong portal</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This login is for carriers only. Please use the{" "}
            <Link href="/admin/login" className="text-accent hover:underline">
              Dispatcher Login
            </Link>
            .
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

  if (isSignedIn) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">Redirecting…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <SignIn
        routing="hash"
        fallbackRedirectUrl="/carrier/dashboard"
        signUpFallbackRedirectUrl="/carrier/dashboard"
      />
    </Shell>
  );
}
