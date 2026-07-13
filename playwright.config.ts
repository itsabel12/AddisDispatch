import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * Two tiers of specs live under `e2e/`:
 *  - Public specs (marketing, accessibility, auth-redirect guards) run with no
 *    secrets — they are the CI gate.
 *  - Authed specs (carrier onboarding, invoicing) sign in with @clerk/testing
 *    and self-skip unless the E2E Clerk env vars are present (see e2e/README.md).
 *
 * The web server is the Next dev server; an already-running instance is reused.
 */
const PORT = Number(process.env.E2E_PORT ?? 3000);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      // Build-time stand-ins so the server boots in CI without real secrets.
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000",
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_placeholder",
      CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_placeholder",
    },
  },
});
