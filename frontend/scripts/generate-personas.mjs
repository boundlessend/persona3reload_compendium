// собирает статический public/personas.json из backend/docs/compendium.tsv.
// запускается на pre-сборке, чтобы фронтенд не зависел от рантайм-бэкенда:
// TSV остаётся единственным источником правды, а на прод уезжает готовый JSON.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const TSV_PATH = resolve(here, "../data/compendium.tsv");
const OUT_PATH = resolve(here, "../public/personas.json");

const INT_FIELDS = new Set([
  "id",
  "level",
  "strength",
  "magic",
  "endurance",
  "agility",
  "luck",
  "dlc",
]);
const ARRAY_FIELDS = new Set([
  "weak",
  "resists",
  "reflects",
  "absorbs",
  "nullifies",
]);

const raw = readFileSync(TSV_PATH, "utf8");
const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);
const headers = lines[0].split("\t");

const personas = lines.slice(1).map((line) => {
  const cells = line.split("\t");
  const row = {};
  headers.forEach((header, index) => {
    const value = (cells[index] ?? "").trim();
    if (INT_FIELDS.has(header)) {
      row[header] = value ? Number.parseInt(value, 10) : 0;
    } else if (ARRAY_FIELDS.has(header)) {
      row[header] = value
        ? value.split(",").map((item) => item.trim()).filter(Boolean)
        : [];
    } else {
      row[header] = value;
    }
  });
  if (!row.query) {
    throw new Error(`row with id=${row.id} has no query field`);
  }
  // локально зеркалированный арт лежит в public/personas/<query>.png
  row.image = `/personas/${row.query}.png`;
  return row;
});

// целостность данных проверяется на этапе сборки (замена старой backend/CI-проверки)
const seen = new Set();
for (const persona of personas) {
  if (seen.has(persona.query)) {
    throw new Error(`duplicate query: ${persona.query}`);
  }
  seen.add(persona.query);
}
if (personas.length < 200) {
  throw new Error(`unexpectedly few personas: ${personas.length}`);
}

personas.sort((a, b) => a.id - b.id);
writeFileSync(OUT_PATH, JSON.stringify(personas));
console.log(`generated ${personas.length} personas -> public/personas.json`);
