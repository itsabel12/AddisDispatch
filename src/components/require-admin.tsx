"use client";

/**
 * Admin/dispatcher gate. Renders children only for a signed-in user whose Clerk
 * role is "admin". This is UI defense-in-depth — the FastAPI backend enforces
 * the real boundary (every /admin route requires the admin role) regardless of
 * what the browser shows.
 *
 *  - loading   -> connecting message
 *  - signed out-> branded admin sign-in
 *  - not admin -> access-denied screen (with sign out)
 *  - admin     -> children
 */

import { SignIn, SignOutButton, useAuth, useUser } from "@clerk/nextjs";

import { clerkAppearance } from "@/lib/clerk-appearance";

function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="portal-rise w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <p className="font-heading text-lg font-semibold tracking-tight">
          Addis<span className="text-accentDeep">Dispatch</span>
          <span className="ml-2 font-normal text-muted-foreground">Command Center</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <h1 className="sr-only">{title}</h1>
        <div className="mt-6 flex justify-center">{children}</div>
      </div>
    </div>
  );
}

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return (
      <Shell title="Loading" subtitle="Dispatcher console">
        <p className="text-sm text-muted-foreground">Connecting to the sign-in service…</p>
      </Shell>
    );
  }

  if (!isSignedIn) {
    return (
      <Shell title="Sign in" subtitle="Administrator sign-in — internal dispatch operations.">
        <SignIn
          routing="hash"
          appearance={clerkAppearance}
          fallbackRedirectUrl="/admin/dashboard"
          signUpFallbackRedirectUrl="/admin/dashboard"
        />
      </Shell>
    );
  }

  const role = (user?.publicMetadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    return (
      <Shell title="Access denied" subtitle="Dispatcher console">
        <div className="rounded-xl border border-danger/25 bg-danger/5 p-6 text-left">
          <p className="text-sm font-medium text-foreground">
            This console is for AddisDispatch administrators only.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account doesn&apos;t have dispatcher access. If you&apos;re a carrier,
            use the{" "}
            <a href="/carrier/login" className="font-medium text-accentDeep hover:underline">
              carrier login
            </a>
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
      </Shell>
    );
  }

  return <>{children}</>;
}
