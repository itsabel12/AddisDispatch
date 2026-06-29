import Link from "next/link";
import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/portal/session";
import { signOut } from "../actions";

export default async function PendingPage() {
  const { carrier, profile } = await getPortalContext();
  if (carrier.status === "active") redirect("/portal");

  const suspended = carrier.status === "suspended";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bgBase px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-portalBorder bg-bgSurface p-8 text-center">
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="text-lg font-bold tracking-tight text-gold">
            Addis<span className="text-textPrimary">Dispatch</span>
          </span>
        </Link>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-2xl">
          {suspended ? "⏸️" : "⏳"}
        </div>

        <h1 className="mt-5 text-xl font-bold text-textPrimary">
          {suspended ? "Account suspended" : "Pending approval"}
        </h1>
        <p className="mt-3 text-sm font-light leading-relaxed text-textMuted">
          {suspended ? (
            <>
              Your account for <span className="text-textPrimary">{carrier.company_name}</span> is
              currently suspended. Reach out to your dispatcher to restore access.
            </>
          ) : (
            <>
              Thanks, {profile.full_name?.split(" ")[0] || "there"}. We&apos;re reviewing the
              authority for <span className="text-textPrimary">{carrier.company_name}</span>. Once
              approved, your loads, documents, and settlements will appear here.
            </>
          )}
        </p>

        <form action={signOut} className="mt-7">
          <button
            type="submit"
            className="rounded-full border border-portalBorder px-6 py-2.5 text-sm font-medium text-textPrimary transition-colors hover:border-gold/50 hover:text-gold"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
