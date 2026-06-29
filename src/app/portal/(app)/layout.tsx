import { redirect } from "next/navigation";
import { getPortalContext } from "@/lib/portal/session";
import Sidebar from "@/components/portal/Sidebar";
import NotificationBell from "@/components/portal/NotificationBell";
import { signOut } from "../actions";

export default async function PortalAppLayout({ children }: { children: React.ReactNode }) {
  const { carrier, profile } = await getPortalContext();

  // Non-active carriers never reach interior screens (RLS also blocks load/settlement data).
  if (carrier.status === "onboarding") redirect("/portal/onboarding");
  if (carrier.status !== "active") redirect("/portal/pending");

  return (
    <div className="flex min-h-screen bg-bgBase text-textPrimary">
      <Sidebar companyName={carrier.company_name} fullName={profile.full_name} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar — wordmark on mobile, notification bell on all sizes */}
        <header className="flex items-center justify-between gap-3 border-b border-portalBorder bg-bgSurface px-5 py-3">
          <span className="text-base font-bold tracking-tight text-gold md:invisible">
            Addis<span className="text-textPrimary">Dispatch</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <span className="hidden max-w-[28vw] truncate text-xs font-light text-textMuted sm:inline md:hidden">
              {carrier.company_name}
            </span>
            <form action={signOut} className="md:hidden">
              <button
                type="submit"
                aria-label="Sign out"
                className="flex items-center gap-1.5 rounded-full border border-portalBorder px-3 py-1.5 text-xs font-medium text-textMuted transition-colors hover:border-gold/50 hover:text-gold"
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-5 py-6 pb-24 sm:px-8 md:pb-10">{children}</main>
      </div>
    </div>
  );
}
