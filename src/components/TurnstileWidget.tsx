"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * Cloudflare Turnstile widget (explicit render) for the public lead forms.
 *
 * Renders only when NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured; otherwise it
 * renders nothing and the form proceeds without a token (dev convenience — the
 * server route skips verification in development too). `resetSignal` forces the
 * widget to reset so a second submission gets a fresh, unused token.
 */

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export const turnstileConfigured = Boolean(SITE_KEY);

type Props = {
  onVerify: (token: string | null) => void;
  /** Change this value to reset the widget (e.g. after a submit). */
  resetSignal?: number;
};

export default function TurnstileWidget({ onVerify, resetSignal = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);

  // Keep the latest callback without re-running the render effect below.
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    function tryRender() {
      if (cancelled || !window.turnstile || !containerRef.current) return false;
      if (widgetIdRef.current) return true;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onVerifyRef.current(null),
        "error-callback": () => onVerifyRef.current(null),
      });
      return true;
    }

    // The script may not be ready on first mount; poll briefly until it is.
    if (!tryRender()) {
      const iv = setInterval(() => {
        if (tryRender()) clearInterval(iv);
      }, 200);
      return () => {
        cancelled = true;
        clearInterval(iv);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  // Reset on demand (clears the consumed token).
  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
      onVerifyRef.current(null);
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      {/*
       * `[&_a]:hidden` suppresses the bare "Troubleshoot" link Cloudflare injects
       * directly into this container when a challenge errors — it renders as an
       * unstyled blue anchor that clashes with the form design. A genuine
       * interactive challenge renders inside an iframe (not an <a>), so it is
       * unaffected and still shows.
       */}
      <div ref={containerRef} className="min-h-[65px] [&_a]:hidden" />
    </>
  );
}
