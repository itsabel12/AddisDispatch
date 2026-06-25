"use client";

import { useEffect, useState } from "react";
import { openBooking } from "@/lib/overlay";
import { ArrowUpIcon } from "./icons";

export default function FloatingActions() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showTop = scrollY > 450;
  const showBar = scrollY > 300;

  return (
    <>
      {/* WhatsApp */}
      <a
        href="https://wa.me/15550000000"
        target="_blank"
        rel="noopener noreferrer"
        title="WhatsApp"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-leafGreen text-2xl shadow-lg transition-transform hover:scale-110"
      >
        💬
      </a>

      {/* Back to top */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className={`fixed bottom-20 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-bandDarker text-gold shadow-lg transition-all ${
          showTop ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
        }`}
      >
        <ArrowUpIcon width={20} height={20} />
      </button>

      {/* Mobile CTA bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-white/10 bg-bandDarker/95 p-3 backdrop-blur-md transition-transform md:hidden ${
          showBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <a
          href="#contact"
          className="flex-1 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-bandDarker"
        >
          Get Started
        </a>
        <button
          type="button"
          onClick={openBooking}
          className="flex-1 rounded-full border border-white/15 px-5 py-3 text-center text-sm font-light text-offWhite"
        >
          Free Consultation
        </button>
      </div>
    </>
  );
}
