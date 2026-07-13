import { test as base, expect } from "@playwright/test";
import { clerk, clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright";

/**
 * Shared auth harness for the credential-gated E2E specs.
 *
 * The onboarding + invoicing flows need a signed-in carrier / dispatcher, which
 * requires real Clerk *test* credentials. Rather than fail CI when they're
 * absent, `authedTest(role)` returns a test object that self-skips unless the
 * matching env vars are set. See e2e/README.md for how to provide them.
 *
 * Required env vars per role:
 *   carrier : E2E_CARRIER_EMAIL, E2E_CARRIER_PASSWORD
 *   admin   : E2E_ADMIN_EMAIL,   E2E_ADMIN_PASSWORD
 * Plus a valid CLERK publishable + secret test key (already needed to boot).
 */
type Role = "carrier" | "admin";

function creds(role: Role): { email?: string; password?: string } {
  if (role === "carrier") {
    return { email: process.env.E2E_CARRIER_EMAIL, password: process.env.E2E_CARRIER_PASSWORD };
  }
  return { email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD };
}

export function authedTest(role: Role) {
  const { email, password } = creds(role);
  const enabled = Boolean(email && password);

  const test = base.extend({});

  // Skip the whole file cleanly when this role has no configured test user.
  test.skip(!enabled, `Set E2E_${role.toUpperCase()}_EMAIL / _PASSWORD to run the ${role} flow.`);

  test.beforeAll(async () => {
    await clerkSetup();
  });

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page });
    // Land on the role's login, then sign in via Clerk's testing API (no UI).
    await page.goto(role === "carrier" ? "/carrier/login" : "/admin/login");
    await clerk.signIn({
      page,
      signInParams: { strategy: "password", identifier: email!, password: password! },
    });
  });

  return test;
}

export { expect };
