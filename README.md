# Persona Compendium · Persona 3 Reload

A catalogue of all 213 personas from Persona 3 Reload: arcana, stats and
elemental affinities, with artwork mirrored locally. A pure static single-page
app built on Vite + React 19 + TypeScript + Tailwind v4, forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium).
There is no runtime backend: the dataset is generated at build time and served
as static files.

## Architecture

Static pipeline, no server process at runtime:

```
frontend/data/compendium.tsv     213 rows, tab-separated, one header, source of truth
        |
        |  build step: node scripts/generate-personas.mjs (runs on predev / prebuild)
        v
frontend/public/personas.json    generated build artifact
        |
        |  bundled by `vite build`
        v
frontend/dist/  ->  static host / CDN  --(fetch /personas.json)-->  browser SPA
art: frontend/public/personas/*.png   213 files, shipped in repo
```

- `frontend/data/compendium.tsv` is the single source of truth. The build step
  `frontend/scripts/generate-personas.mjs` parses it into a typed
  `frontend/public/personas.json`, which the SPA fetches as `/personas.json`.
- `frontend/` - SPA: hero, search, arcana filter, card grid, and a modal with
  description, stats and affinities. Arcana and element lists are derived from
  the data. Persona art lives under `frontend/public/personas/` and ships with
  the repo.
- Routing is client-side: `/persona/<query>` opens a persona directly via the
  History API. On a static host this works through an SPA-fallback rewrite to
  `index.html`.
- Client state is limited to the favorites list in `localStorage`. No accounts,
  auth, database or API.

## Run locally

Requires Node 22+. Python is not needed.

```bash
cd frontend
npm install

# dev server with hot reload (predev regenerates personas.json first)
npm run dev            # http://localhost:5173

# production build (prebuild regenerates personas.json)
npm run build          # output in frontend/dist

# preview the production build locally
npm run preview
```

You can regenerate the data on its own with `npm run generate:data`.

## Tests

End-to-end smoke tests (Playwright, `frontend/e2e/compendium.spec.ts`) run
against the static production build served by `vite preview` - no Python and no
backend:

```bash
cd frontend
npm run test:e2e
```

CI (GitHub Actions) runs two jobs: `frontend` (typecheck + build) and `e2e`.
Data integrity is enforced at generation time: `generate-personas.mjs` fails the
build on a duplicate or empty `query`.

## Deploy

The app is a static site. The included [`render.yaml`](render.yaml) deploys it to
Render:

- build: `cd frontend && npm ci && npm run build`
- publish: `frontend/dist`
- SPA-fallback rewrite of `/*` to `/index.html`
- security headers: `Content-Security-Policy`, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`,
  `Permissions-Policy`, `Strict-Transport-Security`

The same build and publish settings work on Vercel, Netlify or Cloudflare Pages;
each needs an equivalent SPA rewrite and the same security headers.

## License

BSD 3-Clause, see [LICENSE](LICENSE). Persona and Megami Tensei are trademarks
of Atlus; the game data and artwork belong to Atlus.
