/**
 * Support contact details + app version, shared by the authenticated
 * Help / Support page (app/admin/support). Centralized so the numbers and
 * hours live in one place.
 *
 * NOTE: the WhatsApp number is a placeholder shared with the marketing
 * FloatingActions widget — replace it with the real support line before launch.
 */

export const SUPPORT_EMAIL = "support@addisdispatch.com";

// E.164 without the leading "+", as required by wa.me deep links.
export const SUPPORT_WHATSAPP_NUMBER = "15550000000"; // TODO: real support line
export const SUPPORT_WHATSAPP_DISPLAY = "+1 (555) 000-0000";
export const SUPPORT_WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;

export const BUSINESS_HOURS = "Monday–Friday, 8:00 AM – 6:00 PM Central Time";

// Injected at build time from package.json via next.config.ts.
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
