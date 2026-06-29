"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { SVGProps } from "react";
import { signOut } from "@/app/portal/actions";

type IconProps = SVGProps<SVGSVGElement>;
const iconBase = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const GridIcon = (p: IconProps) => (<svg {...iconBase} {...p}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>);
const TruckIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M3 7h11v8H3zM14 10h4l3 3v2h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>);
const DocIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="13" y2="17" /></svg>);
const DollarIcon = (p: IconProps) => (<svg {...iconBase} {...p}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>);
const UserIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>);
const HistoryIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>);
const ShieldIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>);
const CompassIcon = (p: IconProps) => (<svg {...iconBase} {...p}><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>);
const MoreIcon = (p: IconProps) => (<svg {...iconBase} {...p}><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>);
const LogoutIcon = (p: IconProps) => (<svg {...iconBase} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>);

type NavItem = { href: string; label: string; Icon: (p: IconProps) => React.JSX.Element; exact?: boolean; primary?: boolean };

const nav: NavItem[] = [
  { href: "/portal", label: "Dashboard", Icon: GridIcon, exact: true, primary: true },
  { href: "/portal/loads", label: "Loads", Icon: TruckIcon, primary: true },
  { href: "/portal/documents", label: "Documents", Icon: DocIcon, primary: true },
  { href: "/portal/settlements", label: "Settlements", Icon: DollarIcon, primary: true },
  { href: "/portal/compliance", label: "Compliance", Icon: ShieldIcon },
  { href: "/portal/availability", label: "Availability", Icon: CompassIcon },
  { href: "/portal/activity", label: "Activity", Icon: HistoryIcon },
  { href: "/portal/profile", label: "Profile", Icon: UserIcon },
];

const primary = nav.filter((n) => n.primary);
const secondary = nav.filter((n) => !n.primary);

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({
  companyName,
  fullName,
}: {
  companyName: string;
  fullName: string | null;
}) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      {/* Desktop left rail — full nav */}
      <aside className="hidden w-60 flex-none flex-col border-r border-portalBorder bg-bgSurface md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold" />
          <span className="text-lg font-bold tracking-tight text-gold">
            Addis<span className="text-textPrimary">Dispatch</span>
          </span>
        </div>

        <div className="mx-3 mb-4 rounded-xl border border-portalBorder bg-bgElevated px-3 py-3">
          <div className="truncate text-sm font-semibold text-textPrimary">{companyName}</div>
          {fullName && <div className="truncate text-xs font-light text-textMuted">{fullName}</div>}
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {nav.map(({ href, label, Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-gold/12 text-gold" : "text-textMuted hover:bg-bgElevated hover:text-textPrimary"
                }`}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold" />}
                <Icon />
                {label}
              </Link>
            );
          })}
        </nav>

        <form action={signOut} className="border-t border-portalBorder p-3">
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-textMuted transition-colors hover:bg-bgElevated hover:text-textPrimary">
            <LogoutIcon />
            Sign out
          </button>
        </form>
      </aside>

      {/* Mobile bottom bar — core items + More */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-portalBorder bg-bgSurface/95 backdrop-blur-md md:hidden">
        {primary.map(({ href, label, Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link key={href} href={href} className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium ${active ? "text-gold" : "text-textMuted"}`}>
              <Icon width={20} height={20} />
              {label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium ${secondary.some((s) => isActive(pathname, s.href, s.exact)) ? "text-gold" : "text-textMuted"}`}
        >
          <MoreIcon width={20} height={20} />
          More
        </button>
      </nav>

      {/* Mobile "More" sheet */}
      {moreOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMoreOpen(false)} role="presentation">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-portalBorder bg-bgSurface p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-portalBorder" />
            <div className="grid grid-cols-3 gap-3">
              {secondary.map(({ href, label, Icon, exact }) => {
                const active = isActive(pathname, href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-xs font-medium ${active ? "border-gold/40 bg-gold/12 text-gold" : "border-portalBorder text-textMuted"}`}
                  >
                    <Icon width={22} height={22} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
