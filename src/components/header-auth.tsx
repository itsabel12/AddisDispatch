"use client";

/**
 * Account control. Client component so it reacts instantly to sign-in /
 * sign-out. Shows the Clerk avatar menu (UserButton) plus the signed-in user's
 * name and email — used in the dispatcher sidebar footer and the carrier header.
 */

import { UserButton, useAuth, useUser } from "@clerk/nextjs";

export function HeaderAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="flex items-center gap-2.5">
      <UserButton />
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-medium text-foreground">
          {user?.fullName ?? user?.username ?? "Dispatcher"}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {user?.primaryEmailAddress?.emailAddress}
        </p>
      </div>
    </div>
  );
}
