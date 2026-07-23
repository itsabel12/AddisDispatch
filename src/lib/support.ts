/**
 * Support contact details + app version, shared by the authenticated
 * Help / Support page (app/admin/support) and the marketing FloatingActions
 * widget. Centralized so the address and number live in one place.
 */

export const SUPPORT_EMAIL = "contact@addisdispatch.com";

// Support line — the same number serves both phone calls and WhatsApp.
export const SUPPORT_PHONE_DISPLAY = "+1 (469) 248-5122";
export const SUPPORT_PHONE_TEL = "+14692485122"; // E.164, for tel: links

// E.164 without the leading "+", as required by wa.me deep links.
export const SUPPORT_WHATSAPP_NUMBER = "14692485122";
export const SUPPORT_WHATSAPP_DISPLAY = SUPPORT_PHONE_DISPLAY;
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;

export const BUSINESS_HOURS = "Monday–Friday, 8:00 AM – 6:00 PM Central Time";

// Injected at build time from package.json via next.config.ts.
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

// Deployment environment (Vercel env at build, else NODE_ENV), title-cased for
// display: "Production" | "Preview" | "Development". Wired in next.config.ts.
const RAW_APP_ENV = process.env.NEXT_PUBLIC_APP_ENV ?? "development";
export const APP_ENVIRONMENT =
  RAW_APP_ENV.charAt(0).toUpperCase() + RAW_APP_ENV.slice(1);
