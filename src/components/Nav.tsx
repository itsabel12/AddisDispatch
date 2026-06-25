"use client";

import { useEffect, useState } from "react";
import { MenuIcon, CloseIcon } from "./icons";
import { openPortal } from "@/lib/overlay";

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
        scrolled
          ? "border-b border-white/5 bg-bandDarker/85 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <a href="#top" className="group flex items-center gap-2" aria-label="AddisDispatch home">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gold transition-transform group-hover:scale-125" />
          <span className="text-lg font-bold tracking-tight text-gold">
            Addis<span className="text-offWhite">Dispatch</span>
          </span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm font-light text-mutedGrey transition-colors hover:text-gold"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="#contact"
          className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-bandDarker transition-all hover:shadow-[0_0_24px_-4px] hover:shadow-gold/60 lg:inline-block"
        >
          Request Dispatch
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-offWhite lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 bg-bandDarker/95 px-6 py-4 backdrop-blur-md lg:hidden">
          <ul className="flex flex-col gap-4">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base font-light text-offWhite hover:text-gold"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  openPortal();
                }}
                className="block text-base font-light text-offWhite hover:text-gold"
              >
                Carrier Portal
              </button>
            </li>
            <li>
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-bandDarker"
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
