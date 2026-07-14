# PRD - Persona Compendium (Persona 3 Reload)

Status: shipped / maintained · Last updated: 2026-07-15

## 1. Summary

A single-page web app that mirrors the in-game Persona compendium from
*Persona 3 Reload*. Visitors browse all 213 personas, filter by arcana, search
by name, and open a detail view with stats, elemental affinities and artwork.
The dataset is static and read-only; there is no user account, no write path
and no external database. The app ships as a pure static bundle with no runtime
backend.

## 2. Goals

- Present the complete persona roster (213 entries) with correct stats,
  arcana and affinities.
- Make any persona reachable in one or two interactions (search + filter).
- Ship artwork with the repo so the app has no third-party runtime
  dependency for images.
- Generate the dataset at build time so the deployed app is a self-contained
  static bundle with no runtime backend.

## 3. Non-goals

- No accounts, authentication or server-side state; client-side persistence is
  limited to favorites, the collection tracker and the theme in localStorage.
- No live data source; the compendium is a static TSV/JSON compiled at build
  time.
- No mobile-native apps (responsive web plus an installable, offline-capable
  PWA only).

## 4. Users

- Persona 3 Reload players looking up a specific persona's stats or
  weaknesses mid-game.
- Players browsing by arcana to plan fusions externally.

## 5. Implemented features

### Catalog
- Grid of 213 personas with selectable sort (default id / level / name /
  arcana / each stat) and a paginated "Load more".
- Free-text search by name (case-insensitive, substring).
- Arcana filter derived from the data (no hardcoded list).
- Affinity filter: two stackable conditions, each an element plus a relation
  (weak / resists / reflects / absorbs / nullifies); the element list is
  derived from the data.
- Source filter (all / base / DLC / special-fusion), level-range and origin
  filters, favorites-only, no-weakness, and not-yet-collected filters.
- Applied data filters render as removable chips and are serialized to the URL,
  so a filtered view is shareable and restored on reload (device-local toggles
  like favorites/collected stay out of the URL).
- Live result counter with `aria-live`.
- Command palette (`Cmd/Ctrl-K` or the navbar search button): a dependency-free
  fuzzy finder over every persona, arcana and section, keyboard-navigable.

### Persona detail
- Modal with description, five stats shown as both a radar and bars (normalized
  to 99), an elemental affinity matrix over all nine elements (glyph-coded, not
  colour-only), learned skills (name, element icon, effect, target, learn level)
  and fusion recipes (special recipe, reverse recipes, or a DLC note). Opens
  with a View Transitions cross-fade where supported.
- Expandable multi-step fusion chain to build the persona: cheapest path, or
  a "from my collection" mode that backtracks to owned personas and marks gaps.
- Theurgy line for the 14 personas in a fusion-spell pair, linking the partner.
- Favorite and collected toggles, persisted in localStorage.
- Artwork zoom overlay; inline SVG placeholder when an image is missing.
- Shareable deep link `/persona/<query>`, reflected in title and history.

### Fusion & arcana
- Compare mode: two personas side by side plus their forward fusion result,
  clickable through to that persona.
- Multi-step recipe finder (in the persona modal, see above).
- `/arcana` index with a 22x22 arcana fusion matrix, a special-recipe list,
  the seven protagonist Theurgy fusion spells and each party member's Theurgy
  skill (base and evolved form).
- Per-arcana pages (`/arcana/<slug>`) with the confidant / Social Link, the
  arcana's personas, and its ultimate persona plus how it unlocks.

### Skills
- `/skills` catalog of skills with owners, element icons, effects, and a modal
  guide to how skills are learned and named.

### Bosses & requests
- `/bosses`: the 57 story bosses with weaknesses / resistances (filter by
  weakness); each weakness links to `/skills` filtered by that element.
- `/requests`: all 101 Elizabeth's Requests with rewards, filterable by reward
  type and by deadline / missable.

### Team
- Team mode: pick a party and see its defensive coverage (shared weaknesses /
  resistances) and offensive damage types with gaps.

### Collection & personalization
- Collection tracker: mark personas collected; a hero progress bar shows
  base and with-DLC totals, and drives the not-collected filter.
- "Dark Hour" dark theme following `prefers-color-scheme` with a persisted
  toggle that cuts over instantly (transitions suppressed for the switch, no
  cross-fade); installable PWA with an offline service worker that prompts to
  reload when a new build deploys (version-stamped worker + waiting-worker
  detection).
- Favorites drive the favorites filter and card badges.

### Accessibility
- All dialogs (persona detail, compare, team, skills guide) are labelled
  `role="dialog"`, closeable via Escape and backdrop, with a Tab focus trap,
  focus restored to the trigger on close, and background scroll locked while
  open (shared `useDialog` hook).
- Filter and mode controls have accessible names and pressed state.
- `prefers-reduced-motion` disables smooth scroll, transitions and the modal
  view transition.
- `scroll-padding-top` keeps the sticky navbar from obscuring a focused element
  or an in-page anchor target (WCAG 2.4.11); interactive targets meet the 2.5.8
  minimum size (audited with axe `target-size`).
- Accessibility is regression-tested in CI: `e2e/a11y.spec.ts` runs axe-core
  over the main screens and open dialogs (including the command palette).

## 6. Architecture

```
frontend/data/compendium.tsv        213 rows, tab-separated, source of truth
        |
        |  build step (predev / prebuild): node scripts/generate-personas.mjs
        v
frontend/public/personas.json       generated build artifact
        |
        |  bundled by `vite build`
        v
frontend/dist/  ->  static host / CDN  --(fetch /personas.json)-->  browser SPA
art: frontend/public/personas/*.webp  213 files, shipped in repo
skills: frontend/public/skills.json  (generate-skills.mjs, committed)
```

- **Data pipeline** - `generate-personas.mjs` parses the TSV once at build time
  into typed rows, sorts by id, and writes `public/personas.json`. It runs
  automatically before `dev` and `build` (`predev` / `prebuild`). The TSV is the
  single source of truth; the JSON is a disposable build artifact.
- **Frontend** - React 19 + TypeScript + Vite + Tailwind v4 SPA. It fetches
  `/personas.json` and `/skills.json` and derives arcana and element lists from
  the data. Routing is client-side (`/persona/<query>`, `/arcana/<slug>`,
  `/skills`), served through the host's SPA-fallback rewrite to `index.html`.
  `scripts/prerender-meta.mjs` (postbuild) writes per-route `index.html` files
  for every persona, arcana, skills, bosses and requests route with
  route-specific meta and JSON-LD (WebSite, BreadcrumbList, and ItemList on the
  home and arcana listings), preloads the display font, and version-stamps the
  service worker with the main-bundle hash. An inline speculation-rules script
  prefetches the top-level section routes on hover (allowed by the CSP
  `'inline-speculation-rules'` source).
- **Offline** - `public/sw.js` is a dependency-free service worker registered
  only in production: network-first for navigations (per-route plus a `/`
  offline fallback), stale-while-revalidate for the JSON data, cache-first for
  hashed assets and viewed artwork. Its cache name is stamped with the build
  hash so each deploy is a new worker; it waits instead of auto-activating and
  the app surfaces a "reload" prompt. `public/theme-init.js` sets the saved
  theme before first paint (external file, so it passes the strict CSP).
- **No runtime backend** - there is no server process, database, auth or API.
  Client-side state is favorites, the collection tracker and the theme, all in
  localStorage.

## 7. Data pipeline

Build-time generation replaces any runtime API. `generate-personas.mjs`:

- reads `frontend/data/compendium.tsv` (tab-separated, one header row);
- coerces integer fields (`id, level, strength, magic, endurance, agility,
  luck, dlc`) and splits comma-separated array fields (`weak, resists,
  reflects, absorbs, nullifies`);
- derives `image` as `/personas/<query>.webp`;
- sorts by `id` and writes `frontend/public/personas.json`.

Emitted `Persona` shape: `id, name, arcana, level, description, image,
strength, magic, endurance, agility, luck, weak[], resists[], reflects[],
absorbs[], nullifies[], dlc, query`.

## 8. Non-functional

- **Security**: no server means no runtime attack surface. CSP and hardening
  headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy`, `Strict-Transport-Security`,
  `Cross-Origin-Opener-Policy`, `Cross-Origin-Resource-Policy`) are set by the
  static host per `render.yaml`, not by a runtime process.
- **Performance**: the dataset is generated once at build time into a static
  JSON served from a CDN; images are lazy-loaded with async decode; the catalog
  re-filter is deferred (`useDeferredValue`) so typing stays responsive; and
  speculation-rules prefetch the section routes on hover. Budgets are enforced
  in CI (Lighthouse-CI: CLS and LCP regressions fail the run).
- **Reliability**: no runtime process to crash; the deployed site is static
  files on a CDN with an SPA-fallback rewrite.
- **Data integrity**: the generators raise so a bad dataset fails the build:
  an empty or duplicate `query`, a wrong TSV column count, or upstream schema
  drift (skill / boss match counts out of range). At runtime the data hooks
  throw on a malformed JSON payload instead of rendering an empty page.
- **Testing**: Playwright e2e smoke tests (catalog load, search, all filters,
  modal, deep links, fusion, Theurgy, arcana ultimate, skills, bosses, requests,
  team, tracker, favorites, theme toggle, command palette) run in CI against the
  static production build served by `vite preview`; a separate axe-core spec
  gates accessibility on the main screens and dialogs. ESLint
  (`typescript-eslint`, `react-hooks`, `jsx-a11y`) and Lighthouse-CI budgets run
  in CI too.

## 9. Tech stack

- Frontend: React 19, TypeScript 6, Vite 8, Tailwind CSS v4.
- Build tooling: Node 22+, `generate-personas.mjs` (TSV -> JSON),
  `generate-skills.mjs` (skills JSON), `generate-bosses.mjs` (boss JSON),
  `prerender-meta.mjs` (per-route meta and JSON-LD, postbuild). `requests.json`
  is curated (no machine-readable upstream), committed directly.
- Testing / linting: Playwright (e2e + `@axe-core/playwright` a11y); ESLint
  (typescript-eslint, react-hooks, jsx-a11y); Lighthouse-CI (`@lhci/cli`).
- Hosting / CI: static hosting (Render via `render.yaml`; Vercel / Netlify /
  Cloudflare Pages compatible), GitHub Actions CI with three jobs (frontend
  typecheck + lint + build, Playwright e2e, Lighthouse-CI).

## 10. Data

213 personas in `frontend/data/compendium.tsv` (tab-separated, one header row).
Each persona has a matching `<query>.webp` under `frontend/public/personas/`.
The build step generates `frontend/public/personas.json` from this file; skills
are a separate committed dataset in `frontend/public/skills.json`. Source data
forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium);
Persona and Megami Tensei are trademarks of Atlus.
