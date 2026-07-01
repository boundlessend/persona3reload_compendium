# PRD - Persona Compendium (Persona 3 Reload)

Status: shipped / maintained · Last updated: 2026-07-02

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

- No fusion calculator or team builder.
- No accounts, authentication or server-side state; the only client-side
  persistence is the favorites list in localStorage.
- No live data source; the compendium is a static TSV compiled to JSON at
  build time.
- No mobile-native apps (responsive web only).

## 4. Users

- Persona 3 Reload players looking up a specific persona's stats or
  weaknesses mid-game.
- Players browsing by arcana to plan fusions externally.

## 5. Implemented features

### Catalog
- Full grid of 213 personas with selectable sort: default (id) / level /
  name / arcana.
- Free-text search by name (case-insensitive, substring).
- Arcana filter derived from the data (no hardcoded list).
- Affinity filter: pick an element and the affinity type
  (weak / resists / reflects / absorbs / nullifies); the element list is
  derived from the data.
- DLC filter (all / base / DLC).
- Favorites-only filter.
- Live result counter.

### Persona detail
- Modal with description, five stats (rendered as bars normalized to 99),
  and grouped affinities (weak / resists / reflects / absorbs / nullifies).
- Favorite toggle, persisted in localStorage.
- Artwork zoom overlay.
- Inline SVG placeholder when an image is missing.
- Shareable deep link: `/persona/<query>` opens the persona directly and is
  reflected in the document title and browser history.

### Compare
- Compare mode: pick any two personas from the grid and view their stats and
  affinities side by side.

### Favorites
- Star personas from the modal; the set persists in localStorage and drives
  the favorites filter and card badges.

### Accessibility
- Both dialogs (persona detail and compare) are labelled `role="dialog"`,
  closeable via Escape and backdrop, with a Tab focus trap, focus restored to
  the trigger on close, and background scroll locked while open (shared
  `useDialog` hook).
- Filter controls (sort, affinity type, element) have accessible names.
- `prefers-reduced-motion` disables smooth scroll and transitions.

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
art: frontend/public/personas/*.png  213 files, shipped in repo
```

- **Data pipeline** - `generate-personas.mjs` parses the TSV once at build time
  into typed rows, sorts by id, and writes `public/personas.json`. It runs
  automatically before `dev` and `build` (`predev` / `prebuild`). The TSV is the
  single source of truth; the JSON is a disposable build artifact.
- **Frontend** - React 19 + TypeScript + Vite + Tailwind v4 SPA. It fetches
  `/personas.json` and derives arcana and element lists from the data. Routing
  is client-side; `/persona/<query>` is a deep link resolved in the SPA and
  served through the host's SPA-fallback rewrite to `index.html`.
- **No runtime backend** - there is no server process, database, auth or API.
  The only client-side state is the favorites list in localStorage.

## 7. Data pipeline

Build-time generation replaces any runtime API. `generate-personas.mjs`:

- reads `frontend/data/compendium.tsv` (tab-separated, one header row);
- coerces integer fields (`id, level, strength, magic, endurance, agility,
  luck, dlc`) and splits comma-separated array fields (`weak, resists,
  reflects, absorbs, nullifies`);
- derives `image` as `/personas/<query>.png`;
- sorts by `id` and writes `frontend/public/personas.json`.

Emitted `Persona` shape: `id, name, arcana, level, description, image,
strength, magic, endurance, agility, luck, weak[], resists[], reflects[],
absorbs[], nullifies[], dlc, query`.

## 8. Non-functional

- **Security**: no server means no runtime attack surface. CSP and hardening
  headers (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy`, `Strict-Transport-Security`) are set by the static host
  per `render.yaml`, not by a runtime process.
- **Performance**: the dataset is generated once at build time into a static
  JSON served from a CDN; images are lazy-loaded with async decode.
- **Reliability**: no runtime process to crash; the deployed site is static
  files on a CDN with an SPA-fallback rewrite.
- **Data integrity**: `generate-personas.mjs` raises on a row with an empty
  `query` and on a duplicate `query`, so a bad dataset fails the build.
- **Testing**: Playwright e2e smoke tests (catalog load, search, modal,
  deep link, arcana filter, favorites, compare) run in CI against the static
  production build served by `vite preview`.

## 9. Tech stack

- Frontend: React 19, TypeScript 5.7, Vite 7, Tailwind CSS v4.
- Build tooling: Node 22+, `generate-personas.mjs` (TSV -> JSON).
- Testing: Playwright (e2e).
- Hosting / CI: static hosting (Render via `render.yaml`; Vercel / Netlify /
  Cloudflare Pages compatible), GitHub Actions CI (frontend typecheck + build,
  Playwright e2e).

## 10. Data

213 personas in `frontend/data/compendium.tsv` (tab-separated, one header row).
Each persona has a matching `<query>.png` under `frontend/public/personas/`. The
build step generates `frontend/public/personas.json` from this file. Source data
forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium);
Persona and Megami Tensei are trademarks of Atlus.
