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
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#top" aria-label="AddisDispatch home">
          <Logo />
        </a>

        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-medium text-inkMuted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="hidden rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-inkMuted transition-colors hover:border-accent hover:text-accent lg:inline-flex"
          >
            Dispatcher Login
          </Link>
          <Link
            href="/carrier/login"
            className="hidden items-center gap-1.5 rounded-lg border border-line px-3.5 py-2 text-xs font-semibold text-inkMuted transition-colors hover:border-accent hover:text-accent lg:inline-flex"
          >
            <UserIcon width={15} height={15} />
            Carrier Login
          </Link>

          <a
            href="#contact"
            className="hidden rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-accentDeep hover:shadow-[0_0_24px_-6px] hover:shadow-accent/70 lg:inline-block"
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
