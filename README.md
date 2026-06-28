# Persona Compendium · Persona 3 Reload

A catalogue of all 213 personas from Persona 3 Reload: arcana, stats and
elemental affinities, with artwork mirrored locally. Built on Vite + React + TypeScript +
Tailwind v4, served by a FastAPI backend forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium).


## Architecture

- `backend/` - FastAPI. Reads `docs/compendium.tsv` into memory (213 read-only
  rows, no database). Endpoints: `GET /api/personas/`,
  `GET /api/personas/{query}`. In production it also serves the built frontend
  from `frontend/dist`, so one process answers everything.
- `frontend/` - SPA: hero, search, arcana filter, card grid, and a modal with
  description, stats and affinities. Persona art lives under
  `frontend/public/personas/` and ships with the repo.

## Run with Docker (recommended)

```bash
docker compose up --build
# open http://localhost:8000
```

One image builds the frontend and serves it together with the API on port 8000.

## Run locally

Requires Node 22+ and Python 3.13+.

```bash
# frontend build
cd frontend && npm install && npm run build && cd ..

# backend (serves the API and the built frontend)
cd backend
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8000
# open http://localhost:8000
```

Development mode with hot reload (two processes):

```bash
cd frontend && npm install && cd ..   # once
npm run dev                           # from repo root: API on :8000 + Vite on :5173
# open http://localhost:5173 (Vite proxies /api to :8000)
```

## License

BSD 3-Clause, see [LICENSE](LICENSE). Persona and Megami Tensei are trademarks
of Atlus; the game data and artwork belong to Atlus.