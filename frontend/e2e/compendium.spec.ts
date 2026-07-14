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

test("shuffle opens a random persona dialog", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Shuffle" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("persona of the day opens the featured persona", async ({ page }) => {
  await page.goto("/");
  const featured = page.getByRole("link", { name: /Persona of the day/i });
  await expect(featured).toBeVisible();
  await featured.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("deep link opens a persona directly", async ({ page }) => {
  await page.goto("/persona/izanagi");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveTitle(/Izanagi/);
});

test("deep link with a trailing slash still opens the persona", async ({
  page,
}) => {
  await page.goto("/persona/izanagi/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveTitle(/Izanagi/);
});

test("team mode analyzes defensive coverage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Team", exact: true }).click();
  await page
    .getByRole("button", { name: /Orpheus/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Slime/i })
    .first()
    .click();
  await page.getByRole("button", { name: "Analyze" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Team" })).toBeVisible();
  // Orpheus weak Electric/Dark + Slime weak Fire/Wind surface as weaknesses
  await expect(dialog.getByText("Weaknesses")).toBeVisible();
  await expect(dialog.getByText("Electric").first()).toBeVisible();
});

test("shared compare URL restores the comparison", async ({ page }) => {
  await page.goto("/?compare=orpheus,slime");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Compare" })).toBeVisible();
  await expect(dialog.getByText("Orpheus")).toBeVisible();
  await expect(dialog.getByText("Slime")).toBeVisible();
});

test("shared team URL restores the coverage panel", async ({ page }) => {
  await page.goto("/?team=orpheus,slime,pixie");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: "Team" })).toBeVisible();
});

test("comparing reflects the selection into the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Compare", exact: true }).click();
  await page
    .getByRole("button", { name: /Izanagi/i })
    .first()
    .click();
  await page
    .getByRole("button", { name: /Orpheus/i })
    .first()
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/compare=/);
});

test("persona modal shows learned skills", async ({ page }) => {
  await page.goto("/persona/orpheus/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Skills" })).toBeVisible();
  await expect(dialog.getByText("Agi", { exact: true })).toBeVisible();
});

test("skills browser lists skills with an element filter", async ({ page }) => {
  await page.goto("/skills/");
  await expect(
    page.getByRole("heading", { name: "Skills", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Fire", exact: true }).click();
  await expect(page.getByText("Agi", { exact: true }).first()).toBeVisible();
});

test("skills guide opens as a modal over the browser", async ({ page }) => {
  await page.goto("/skills/");
  await page.getByRole("link", { name: /How skills are named/ }).click();
  const guide = page.getByRole("dialog", { name: "How skills work" });
  await expect(guide).toBeVisible();
  await expect(guide.getByText("Agidyne", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/skills\/guide\/?$/);
  // Escape closes it and returns to /skills
  await page.keyboard.press("Escape");
  await expect(guide).toBeHidden();
  await expect(page).toHaveURL(/\/skills\/?$/);
});

test("skills guide deep link opens the modal directly", async ({ page }) => {
  await page.goto("/skills/guide/");
  await expect(
    page.getByRole("dialog", { name: "How skills work" }),
  ).toBeVisible();
});

test("clicking a skill reveals its personas and opens one in place", async ({
  page,
}) => {
  await page.goto("/skills/");
  await page.getByRole("button", { name: "Ice", exact: true }).click();
  await page.getByRole("button", { name: /^Bufula/i }).click();
  await expect(page.getByText(/personas learn Bufula/i)).toBeVisible();
  await page.getByRole("button", { name: /High Pixie/i }).click();
  await expect(page.getByRole("dialog", { name: "High Pixie" })).toBeVisible();
});

test("compare shows the normal fusion result", async ({ page }) => {
  await page.goto("/?compare=orpheus,pixie");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Normal fusion")).toBeVisible();
  // Orpheus (Fool 1) + Pixie (Lovers 2) -> Justice arcana, lowest is Angel
  await expect(dialog.getByText("Angel")).toBeVisible();
});

test("clicking the fusion result opens that persona", async ({ page }) => {
  await page.goto("/?compare=orpheus,pixie");
  await page.getByRole("dialog").getByText(/Angel/).click();
  await expect(page).toHaveURL(/\/persona\/angel\//);
});

test("theurgy persona shows its fusion spell and partner link", async ({
  page,
}) => {
  await page.goto("/persona/orpheus/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Theurgy · Cadenza/)).toBeVisible();
  await dialog.getByRole("link", { name: /Apsaras/ }).click();
  await expect(page).toHaveURL(/\/persona\/apsaras\//);
});

test("full fusion chain expands in the persona modal", async ({ page }) => {
  await page.goto("/persona/cybele/");
  const dialog = page.getByRole("dialog");
  // a deep tree node is not shown until the chain is expanded
  await expect(dialog.getByText("Okuninushi")).toHaveCount(0);
  await dialog.getByRole("button", { name: /Show full chain/ }).click();
  await expect(dialog.getByText("Okuninushi").first()).toBeVisible();
});

test("persona modal lists fusion recipes", async ({ page }) => {
  await page.goto("/persona/forneus/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Fusion recipes")).toBeVisible();
});

test("skill effects show in the persona modal", async ({ page }) => {
  await page.goto("/persona/pixie/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("60% Confuse")).toBeVisible();
});

test("special persona shows its special recipe", async ({ page }) => {
  await page.goto("/persona/shiva/");
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(/Rangda × Barong/)).toBeVisible();
});

test("arcana filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "Fool", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("no weakness filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "No weakness", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("marking a persona collected hides it under the Missing filter", async ({
  page,
}) => {
  await page.goto("/persona/pixie/");
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Mark as collected" }).click();
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: "Missing", exact: true }).click();
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
  await page.getByRole("button", { name: /Advanced/ }).click();
  await page.getByRole("button", { name: "DLC", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("element affinity filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: /Advanced/ }).click();
  await page.getByRole("button", { name: "Element", exact: true }).click();
  await page.getByRole("option", { name: "Fire", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("origin filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: /Advanced/ }).click();
  await page.getByRole("button", { name: "Origin" }).click();
  await page.getByRole("option", { name: "Greek", exact: true }).click();
  await expect(page.getByText("26 of 213 personas")).toBeVisible();
});

test("level range filter narrows the catalog", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: /Advanced/ }).click();
  await page.getByLabel("Minimum level").fill("90");
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("second affinity condition narrows the catalog further", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("213 of 213 personas")).toBeVisible();
  await page.getByRole("button", { name: /Advanced/ }).click();
  await page.getByRole("button", { name: "Second element" }).click();
  await page.getByRole("option", { name: "Fire", exact: true }).click();
  await expect(page.getByText("213 of 213 personas")).toHaveCount(0);
});

test("sorting keeps every persona", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sort" }).click();
  await page.getByRole("option", { name: "Name", exact: true }).click();
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

test("unknown deep link shows the 404 page, not a dialog", async ({ page }) => {
  await page.goto("/persona/not-a-real-persona");
  await expect(
    page.getByRole("heading", { name: "Lost to the Dark Hour" }),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("stats section shows arcana distribution", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Stats" }).click();
  await expect(
    page.getByRole("heading", { name: "By the numbers" }),
  ).toBeVisible();
  await expect(page.getByText("Personas per arcana")).toBeVisible();
  await expect(page.getByText("Stat leaders")).toBeVisible();
});

test("stat leader opens the persona", async ({ page }) => {
  await page.goto("/#stats");
  // scope to #stats: "Strength" is also an arcana chip in the browse section
  await page
    .locator("#stats")
    .getByRole("button", { name: /Strength/i })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("bosses page lists bosses and links a weakness to its counters", async ({
  page,
}) => {
  await page.goto("/bosses/");
  await expect(page.getByText("57 of 57 bosses")).toBeVisible();
  // Emperor A is weak to Electric; the weakness links to the Elec skills
  await page.getByRole("link", { name: "Electric", exact: true }).first().click();
  await expect(page).toHaveURL(/\/skills\/\?element=Elec/);
  await expect(page.getByRole("button", { name: "Elec", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("boss weakness filter narrows the list", async ({ page }) => {
  await page.goto("/bosses/");
  await expect(page.getByText("57 of 57 bosses")).toBeVisible();
  await page.getByRole("button", { name: "Fire", exact: true }).click();
  await expect(page.getByText("57 of 57 bosses")).toHaveCount(0);
});

test("requests page lists all 101 and filters by deadline", async ({ page }) => {
  await page.goto("/requests/");
  await expect(page.getByText("101 of 101 requests")).toBeVisible();
  await page.getByRole("button", { name: "Deadline / missable" }).click();
  await expect(page.getByText("14 of 101 requests")).toBeVisible();
});

test("navbar opens the arcana index", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Arcana", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "The Arcana", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Fool/i }).first()).toBeVisible();
});

test("theme toggle switches to dark and persists across reload", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/theme-dark/);
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(html).toHaveClass(/theme-dark/);
  // /theme-init.js must re-apply the stored theme before render on reload
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/theme-dark/);
});

test("arcana index lists party theurgy skills", async ({ page }) => {
  await page.goto("/arcana/");
  const section = page
    .locator("section")
    .filter({ hasText: "PARTY THEURGY" });
  await expect(section.getByText("Cyclone Arrow")).toBeVisible();
  await expect(section.getByText("Tranquility")).toBeVisible();
});

test("arcana detail shows the confidant and its personas", async ({ page }) => {
  await page.goto("/arcana/fool/");
  await expect(
    page.getByRole("heading", { name: "Fool", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Social Link ·/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Orpheus/i }).first(),
  ).toBeVisible();
});

test("arcana detail shows the ultimate persona and its unlock", async ({
  page,
}) => {
  await page.goto("/arcana/magician/");
  await expect(page.getByText("Ultimate persona")).toBeVisible();
  await expect(page.getByText(/Reach Rank 10 with Kenji Tomochika/)).toBeVisible();
  // story-based arcana shows a story unlock instead of a rank
  await page.goto("/arcana/fool/");
  await expect(page.getByText(/Unlocked through the story/)).toBeVisible();
});

test("arcana detail opens a persona modal in place", async ({ page }) => {
  await page.goto("/arcana/fool/");
  await page
    .getByRole("button", { name: /Orpheus/i })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("heading", { name: /Orpheus/i })).toBeVisible();
  // opens in place: no navigation away from the arcana page
  await expect(page).toHaveURL(/\/arcana\/fool\//);
});

test("unknown arcana slug shows the 404 page", async ({ page }) => {
  await page.goto("/arcana/not-an-arcana/");
  await expect(
    page.getByRole("heading", { name: "Lost to the Dark Hour" }),
  ).toBeVisible();
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

test("command palette opens anywhere and navigates to a persona", async ({
  page,
}) => {
  // глобально: открываем с /bosses/, а не с главной
  await page.goto("/bosses/");
  await page.locator("body").press("Control+k");
  await expect(
    page.getByRole("dialog", { name: "Command palette" }),
  ).toBeVisible();
  await page.getByRole("combobox").fill("izanagi");
  await page.getByRole("option", { name: /Izanagi/ }).first().click();
  await expect(page).toHaveURL(/\/persona\/izanagi\/?$/);
  await expect(page.getByRole("dialog")).toBeVisible();
});
