# Persona Compendium · Persona 3 Reload

A catalogue of all 213 personas from Persona 3 Reload: arcana, stats and
elemental affinities, with artwork mirrored locally. Design inspired by
[thursday.social](https://thursday.social), built on Vite + React + TypeScript +
Tailwind v4, served by a FastAPI backend forked from
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium).

[Русская версия ниже.](#русская-версия)

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

Requires Node 20+ and Python 3.13+.

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

---

## Русская версия

Каталог всех 213 персон из Persona 3 Reload: аркана, статы и стихийные
аффинити, арты лежат локально. Дизайн вдохновлён
[thursday.social](https://thursday.social), стек Vite + React + TypeScript +
Tailwind v4, бэкенд на FastAPI (форк
[luyluish/persona-compendium](https://github.com/luyluish/persona-compendium)).

### Архитектура

- `backend/` - FastAPI. Читает `docs/compendium.tsv` в память (213 read-only
  строк, без базы). Эндпоинты: `GET /api/personas/`,
  `GET /api/personas/{query}`. В продакшене тот же процесс отдаёт собранный
  фронтенд из `frontend/dist`.
- `frontend/` - SPA: hero, поиск, фильтр по арканам, сетка карточек и модалка с
  описанием, статами и аффинити. Арты персон лежат в
  `frontend/public/personas/` и входят в репозиторий.

### Запуск через Docker (предпочтительно)

```bash
docker compose up --build
# открыть http://localhost:8000
```

Один образ собирает фронтенд и отдаёт его вместе с API на порту 8000.

### Локальный запуск

Нужны Node 20+ и Python 3.13+.

```bash
# сборка фронтенда
cd frontend && npm install && npm run build && cd ..

# бэкенд (отдаёт API и собранный фронтенд)
cd backend
python -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --port 8000
# открыть http://localhost:8000
```

Дев-режим с hot reload (два процесса):

```bash
cd frontend && npm install && cd ..   # один раз
npm run dev                           # из корня: API на :8000 + Vite на :5173
# открыть http://localhost:5173 (Vite проксирует /api на :8000)
```

### Лицензия

BSD 3-Clause, см. [LICENSE](LICENSE). Persona и Megami Tensei - торговые марки
Atlus, права на игровые данные и арты принадлежат Atlus.
