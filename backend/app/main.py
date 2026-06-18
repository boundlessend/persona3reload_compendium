import csv
from pathlib import Path
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel


TSV_PATH = Path(__file__).resolve().parent.parent / "docs" / "compendium.tsv"
FRONTEND_DIST = (Path(__file__).resolve().parent.parent.parent / "frontend" / "dist").resolve()

ARRAY_FIELDS = ("weak", "resists", "reflects", "absorbs", "nullifies")
INT_FIELDS = ("id", "level", "strength", "magic", "endurance", "agility", "luck", "dlc")

CONTENT_SECURITY_POLICY = (
    "default-src 'self'; "
    "base-uri 'self'; "
    "frame-ancestors 'none'; "
    "object-src 'none'; "
    "script-src 'self'; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; "
    "img-src 'self' data:; "
    "connect-src 'self'"
)
SECURITY_HEADERS = {
    "Content-Security-Policy": CONTENT_SECURITY_POLICY,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}


class Persona(BaseModel):
    id: int
    name: str
    arcana: str
    level: int
    description: str
    image: str
    strength: int
    magic: int
    endurance: int
    agility: int
    luck: int
    weak: list[str]
    resists: list[str]
    reflects: list[str]
    absorbs: list[str]
    nullifies: list[str]
    dlc: int
    query: str


def _parse_row(row: dict[str, str]) -> Persona:
    """разбирает строку TSV в модель Persona: приводит числа и списки к типам,
    а поле image заменяет на путь к локально зеркалированному арту"""
    parsed: dict[str, object] = {}
    for key, value in row.items():
        value = (value or "").strip()
        if key in INT_FIELDS:
            parsed[key] = int(value) if value else 0
        elif key in ARRAY_FIELDS:
            parsed[key] = [item.strip() for item in value.split(",") if item.strip()]
        else:
            parsed[key] = value

    parsed["image"] = f"/personas/{parsed['query']}.png"
    return Persona(**parsed)


@lru_cache(maxsize=1)
def load_personas() -> list[Persona]:
    """читает весь TSV в память один раз и кэширует отсортированный по id список"""
    with TSV_PATH.open(encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        personas = [_parse_row(row) for row in reader]
    return sorted(personas, key=lambda persona: persona.id)


app = FastAPI(
    title="Persona Compendium",
    description="API for getting information about all the personas from Persona 3 Reload",
    version="v1",
)

app.add_middleware(GZipMiddleware, minimum_size=512)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_security_headers(request: Request, call_next) -> Response:
    """навешивает security-заголовки и CSP на каждый ответ"""
    response = await call_next(request)
    for header, value in SECURITY_HEADERS.items():
        response.headers.setdefault(header, value)
    return response


@app.get("/api/personas/", response_model=list[Persona])
async def read_personas(skip: int = 0) -> list[Persona]:
    """отдаёт список персон, опционально пропуская первые skip записей"""
    return load_personas()[skip:]


@app.get("/api/personas/{persona_name}", response_model=Persona)
async def read_persona(persona_name: str) -> Persona:
    """ищет персону по полю query, иначе 404"""
    for persona in load_personas():
        if persona.query == persona_name:
            return persona
    raise HTTPException(status_code=404, detail="Persona not found")


if FRONTEND_DIST.is_dir():
    app.mount(
        "/assets",
        StaticFiles(directory=FRONTEND_DIST / "assets"),
        name="assets",
    )

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str) -> FileResponse:
        """отдаёт файл из сборки фронтенда, защищаясь от path traversal,
        а на неизвестные пути возвращает index.html (клиентский роутинг)"""
        candidate = (FRONTEND_DIST / full_path).resolve()
        if (
            full_path
            and candidate.is_file()
            and candidate.is_relative_to(FRONTEND_DIST)
        ):
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST / "index.html")
