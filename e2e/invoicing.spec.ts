import { authedTest, expect } from "./support/auth";

/**
 * Dispatcher invoicing flow (credential-gated — see e2e/README.md).
 * Signs in as a dispatcher/admin and verifies the invoices surface loads and
 * renders the invoice table (the money-in side of the lifecycle).
 */
const test = authedTest("admin");

test.describe("dispatcher invoicing", () => {
  test("invoices page loads the invoice table", async ({ page }) => {
    await page.goto("/admin/invoices");
    await expect(page).toHaveURL(/\/admin\/invoices/);
    await expect(page.locator("main#main-content")).toBeVisible();
    // Either populated rows or the empty-state — both prove the view rendered.
    await expect(page.locator("table, [data-empty-state]").first()).toBeVisible();
  });

  test("surfaces invoice status without a client error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/admin/invoices");
    await expect(page.locator("main#main-content")).toBeVisible();
    // No uncaught fetch/render errors on the data view we migrated in M2.
    expect(errors.filter((e) => /Unhandled|TypeError|fetch failed/i.test(e))).toHaveLength(0);
  });
});
