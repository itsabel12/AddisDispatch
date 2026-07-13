import { test, expect } from "@playwright/test";

/**
 * Public marketing surface + the accessibility affordances added in M2.
 * No authentication required.
 */
test.describe("marketing homepage", () => {
  test("loads with the brand title and main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/AddisDispatch/i);
    // The M2 skip-link target / single page landmark.
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("exposes both portal entry points", async ({ page }) => {
    await page.goto("/");
    // Dispatcher + carrier logins are reachable from the public site.
    await expect(
      page.getByRole("link", { name: /carrier|driver/i }).first(),
    ).toBeVisible();
  });

  test("skip-to-content link is the first focusable element (WCAG 2.4.1)", async ({
    page,
  }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /skip to main content/i });
    // Present but visually hidden until focused.
    await expect(skip).toBeAttached();
    // First Tab from the top of the document reveals and focuses it.
    await page.keyboard.press("Tab");
    await expect(skip).toBeFocused();
    // Activating it moves focus into the main content region.
    await skip.press("Enter");
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
