# PRD - Persona Compendium (Persona 3 Reload)

Status: shipped / maintained · Last updated: 2026-06-28

## 1. Summary

A single-page web app that mirrors the in-game Persona compendium from
*Persona 3 Reload*. Visitors browse all 213 personas, filter by arcana, search
by name, and open a detail view with stats, elemental affinities and artwork.
The dataset is static and read-only; there is no user account, no write path
and no external database.

## 2. Goals

- Present the complete persona roster (213 entries) with correct stats,
  arcana and affinities.
- Make any persona reachable in one or two interactions (search + filter).
- Ship artwork with the repo so the app has no third-party runtime
  dependency for images.
- Run as a single container that serves both the API and the built frontend.

## 3. Non-goals

- No fusion calculator or team builder.
- No accounts, authentication or server-side state; the only client-side
  persistence is the favorites list in localStorage.
- No live data source; the compendium is a static TSV bundled at build time.
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
- Modal is a labelled `role="dialog"`, closeable via Escape and backdrop.
- Focus trap on Tab, focus returns to the triggering card on close,
  background scroll is locked while open.
- `prefers-reduced-motion` disables smooth scroll and transitions.

## 6. Architecture

```
browser ──HTTP──> FastAPI (uvicorn, :8000)
                    ├── /api/personas/          list (gzip)
                    ├── /api/personas/{query}   single, O(1) index lookup
                    ├── /api/health             liveness
                    └── /{path}                 SPA static + index.html fallback
data: backend/docs/compendium.tsv  (loaded once, lru_cache)
art:  frontend/public/personas/*.png  (213 files, shipped in repo)
```

- **Backend** - FastAPI. TSV parsed once into typed `Persona` Pydantic models
  and cached (`lru_cache`); a second cached index maps `query -> Persona` for
  O(1) single lookups. In production the same process serves the built SPA
  with path-traversal protection and an index.html fallback for client
  routing.
- **Frontend** - React 19 + TypeScript + Vite + Tailwind v4 SPA. In dev, Vite
  proxies `/api` to the backend; in prod the backend serves the build, so the
  browser is always same-origin (no CORS needed).

## 7. API

| Method | Path                    | Returns                         |
| ------ | ----------------------- | ------------------------------- |
| GET    | `/api/personas/`        | `Persona[]`, sorted by id, gzip |
| GET    | `/api/personas/{query}` | `Persona` or 404                |
| GET    | `/api/health`           | `{"status": "ok"}`              |

`Persona`: `id, name, arcana, level, description, image, strength, magic,
endurance, agility, luck, weak[], resists[], reflects[], absorbs[],
nullifies[], dlc, query`.

## 8. Non-functional

- **Security**: CSP and hardening headers (`X-Content-Type-Options`,
  `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy`) on every response; container runs as a non-root user.
- **Performance**: data and lookup index cached in memory; gzip on responses
  >= 512 B; images lazy-loaded with async decode.
- **Reliability**: Docker `HEALTHCHECK` polls `/api/health`;
  `restart: unless-stopped` in compose.
- **Data integrity**: parser raises on a row with an empty `query`; CI asserts
  the dataset loads, has a sane size and unique `query` values.
- **Testing**: Playwright e2e smoke tests (catalog load, search, modal,
  deep link) run in CI against the production-shaped server.

## 9. Tech stack

- Backend: Python 3.13, FastAPI, uvicorn, Pydantic.
- Frontend: React 19, TypeScript 5.7, Vite 7, Tailwind CSS v4.
- Testing: Playwright (e2e).
- Infra: Docker (multi-stage), docker-compose, GitHub Actions CI
  (frontend typecheck + build, backend ruff + data check, docker build,
  Playwright e2e).

## 10. Data

213 personas in `backend/docs/compendium.tsv` (tab-separated, one header row).
Each persona has a matching `<query>.png` under `frontend/public/personas/`.
Source data forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium);
Persona and Megami Tensei are trademarks of Atlus.
