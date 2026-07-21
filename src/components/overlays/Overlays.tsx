"use client";

import { useEffect, useState } from "react";
import BookingModal from "./BookingModal";

/**
 * Single mount point for all the site's interactive overlays. Lives once at the
 * page root and opens in response to the `ad:*` custom events dispatched by the
 * trigger helpers in `@/lib/overlay`. (The carrier portal is a real route now,
 * so it's no longer an overlay here. The legal documents are real routes too —
 * /privacy, /terms, /carrier-agreement — so they're no longer overlays either.)
 */
export default function Overlays() {
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const onBooking = () => setBooking(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setBooking(false);
      }
    };

    window.addEventListener("ad:open-booking", onBooking);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("ad:open-booking", onBooking);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock body scroll while any overlay is open.
  useEffect(() => {
    document.body.style.overflow = booking ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [booking]);

  return <>{booking && <BookingModal onClose={() => setBooking(false)} />}</>;
}
