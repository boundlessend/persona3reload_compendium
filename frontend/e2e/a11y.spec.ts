import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// axe-core sweep of the main surfaces (incl. an open dialog). guards against a11y
// regressions - a планированное нарушение (bad contrast, missing label, ARIA) валит
// прогон. violations сводим к id/impact/count, чтобы падение читалось без дампа
async function expectNoViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).analyze();
  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    nodes: violation.nodes.length,
  }));
  expect(summary).toEqual([]);
}

test("home catalog has no a11y violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "The compendium" })).toBeVisible();
  await expectNoViolations(page);
});

test("open persona dialog has no a11y violations", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Izanagi/i })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectNoViolations(page);
});

test("command palette has no a11y violations", async ({ page }) => {
  await page.goto("/");
  await page.locator("body").press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeVisible();
  await page.getByRole("combobox").fill("iza");
  await expectNoViolations(page);
});

test("arcana index has no a11y violations", async ({ page }) => {
  await page.goto("/arcana/");
  await expect(page.getByRole("heading", { name: /Arcana/i }).first()).toBeVisible();
  await expectNoViolations(page);
});

test("skills page has no a11y violations", async ({ page }) => {
  await page.goto("/skills/");
  await expectNoViolations(page);
});

test("bosses page has no a11y violations", async ({ page }) => {
  await page.goto("/bosses/");
  await expectNoViolations(page);
});

test("requests page has no a11y violations", async ({ page }) => {
  await page.goto("/requests/");
  await expectNoViolations(page);
});
