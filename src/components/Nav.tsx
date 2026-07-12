"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon, UserIcon } from "./icons";
import Logo from "./Logo";

const links = [
  { label: "Services", href: "#services" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Calculator", href: "#calculator" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
  { label: "Apply as Carrier", href: "/apply" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-line bg-base/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-5 lg:px-10">
        {/* Left cluster: logo + primary navigation, with clear separation. */}
        <div className="flex items-center gap-8 xl:gap-14">
          <a href="#top" aria-label="AddisDispatch home" className="shrink-0">
            <Logo />
          </a>

          <ul className="hidden items-center gap-7 lg:flex xl:gap-9">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[0.9375rem] font-medium tracking-tight text-inkMuted transition-colors hover:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right cluster: secondary logins as ghost links + one primary CTA. */}
        <div className="flex items-center gap-6">
          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/admin/login"
              className="text-[0.9375rem] font-medium tracking-tight text-inkMuted transition-colors hover:text-ink"
            >
              Dispatcher Login
            </Link>
            <Link
              href="/carrier/login"
              className="flex items-center gap-1.5 text-[0.9375rem] font-medium tracking-tight text-inkMuted transition-colors hover:text-ink"
            >
              <UserIcon width={16} height={16} />
              Carrier Login
            </Link>
          </div>

          <a
            href="#contact"
            className="hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold tracking-tight text-black transition-all hover:bg-accentDeep hover:shadow-[0_0_24px_-6px] hover:shadow-accent/70 lg:inline-block"
          >
            Request Dispatch
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-line bg-base/95 px-6 py-4 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-medium text-ink hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                onClick={() => setOpen(false)}
                className="block text-base font-medium text-ink hover:text-accent"
              >
                Dispatcher Login
              </Link>
            </li>
            <li>
              <Link
                href="/carrier/login"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-base font-medium text-ink hover:text-accent"
              >
                <UserIcon width={18} height={18} />
                Carrier Login
              </Link>
            </li>
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black"
              >
                Request Dispatch
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
