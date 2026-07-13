import { authedTest, expect } from "./support/auth";

/**
 * Carrier onboarding flow (credential-gated — see e2e/README.md).
 * Signs in as a carrier and walks the post-approval onboarding surface:
 * dashboard, then the document vault where onboarding paperwork is uploaded.
 */
const test = authedTest("carrier");

test.describe("carrier onboarding", () => {
  test("reaches the dashboard after sign-in", async ({ page }) => {
    await page.goto("/carrier/dashboard");
    await expect(page).toHaveURL(/\/carrier\/dashboard/);
    await expect(page.locator("main#main-content")).toBeVisible();
  });

  test("can open the document vault to submit onboarding paperwork", async ({ page }) => {
    await page.goto("/carrier/documents");
    await expect(page).toHaveURL(/\/carrier\/documents/);
    // The upload affordance for W-9 / COI / authority documents.
    await expect(
      page.getByRole("button", { name: /upload|add document|choose file/i }).first(),
    ).toBeVisible();
  });
});
