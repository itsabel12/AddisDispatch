import { test, expect } from "@playwright/test";

/**
 * Authentication gate. Verifies the Clerk middleware (src/proxy.ts) redirects
 * unauthenticated visitors away from both portals to the correct login, and
 * that the login pages themselves render. No credentials required — this is the
 * security half of the "auth flow" E2E.
 */
test.describe("portal auth guards", () => {
  test("unauthenticated /admin/* redirects to the dispatcher login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated /carrier/* redirects to the carrier login", async ({ page }) => {
    await page.goto("/carrier/dashboard");
    await expect(page).toHaveURL(/\/carrier\/login/);
  });

  test("dispatcher login page renders a sign-in surface", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin\/login/);
    await expect(page.locator("body")).toContainText(/sign in|dispatcher|login/i);
  });

  test("carrier login page renders and does not falsely reject a fresh visitor", async ({
    page,
  }) => {
    await page.goto("/carrier/login");
    await expect(page).toHaveURL(/\/carrier\/login/);
    // Regression guard for the M1 bug: a first-time visitor must NOT see the
    // "this login is for carriers only / use the Dispatcher Login" error.
    await expect(page.locator("body")).not.toContainText(/use the dispatcher login/i);
  });
});
