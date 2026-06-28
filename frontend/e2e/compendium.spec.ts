import { expect, test } from "@playwright/test";

test("loads the catalog with personas", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "The compendium" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Izanagi/i }).first(),
  ).toBeVisible();
});

test("search narrows the grid", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Search by name").fill("izanagi");
  await expect(
    page.getByRole("button", { name: /Izanagi/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Pixie/i })).toHaveCount(0);
});

test("opens a persona modal from a card", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Izanagi/i })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Izanagi" })).toBeVisible();
});

test("deep link opens a persona directly", async ({ page }) => {
  await page.goto("/persona/izanagi");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveTitle(/Izanagi/);
});
