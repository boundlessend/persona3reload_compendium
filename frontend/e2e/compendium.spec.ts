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

test("arcana filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "Fool", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("favoriting persists and filters", async ({ page }) => {
  await page.goto("/persona/izanagi");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add to favorites" }).click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "★ Favorites" }).click();
  await expect(
    page.getByRole("button", { name: /Izanagi/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Pixie/i })).toHaveCount(0);
});

test("compare mode opens a side-by-side dialog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page
    .getByRole("button", { name: /Izanagi/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Orpheus/i })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Compare" })).toBeVisible();
});

test("DLC filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "DLC", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("element affinity filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByLabel("Element").selectOption("Fire");
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("sorting keeps every persona", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sort").selectOption("name");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
});

test("no matches shows an empty state", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("Search by name").fill("zzzznotapersona");
  await expect(
    page.getByText("No personas match your filters."),
  ).toBeVisible();
  await expect(page.getByText("0 of 213 personas")).toBeVisible();
});

test("unknown deep link does not open a dialog", async ({ page }) => {
  await page.goto("/persona/not-a-real-persona");
  await expect(
    page.getByRole("heading", { name: "The compendium" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("favorites persist across a reload", async ({ page }) => {
  await page.goto("/persona/izanagi");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Add to favorites" }).click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await page.reload();
  await page.getByRole("button", { name: "★ Favorites" }).click();
  await expect(
    page.getByRole("button", { name: /Izanagi/i }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Pixie/i })).toHaveCount(0);
});

test("closing a persona does not let Back re-open it", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: /Izanagi/i })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
