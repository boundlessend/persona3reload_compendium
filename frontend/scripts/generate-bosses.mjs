// собирает public/bosses.json (story-боссы P3R со слабостями/резистами) из
// данных aqiu384/megaten-fusion-tool - того же источника, что скиллы/фьюжн.
// боссы = записи enemy-data.json с race-суффиксом " B" (полнолуния, Nyx, Reaper,
// Elizabeth и т.п.). resists-код декодируем в те же бакеты, что аффинити персон.
// запускать вручную (сетевой fetch), результат коммитим статикой.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(here, "../public/bosses.json");
const UPSTREAM_SHA = "629e89515fefe58f9e83f7d78d33883c92fa3c60";
const BASE = `https://raw.githubusercontent.com/aqiu384/megaten-fusion-tool/${UPSTREAM_SHA}/src/app/p3r/data`;

// порядок стихий в resists-строке (comp-config.resistElems), в словаре персон
const ELEM_NAME = {
  sla: "Slash", str: "Strike", pie: "Pierce", fir: "Fire", ice: "Ice",
  ele: "Electric", win: "Wind", lig: "Light", dar: "Dark", alm: "Almighty",
};
// первая цифра resist-кода -> бакет аффинити (5 = нейтрально, пропускаем)
const BUCKET = { 6: "weak", 4: "resists", 3: "nullifies", 2: "reflects", 1: "absorbs" };

async function fetchJson(name) {
  const response = await fetch(`${BASE}/${name}`);
  if (!response.ok) throw new Error(`failed to fetch ${name}: ${response.status}`);
  return response.json();
}

const [enemyData, compConfig] = await Promise.all([
  fetchJson("enemy-data.json"),
  fetchJson("comp-config.json"),
]);
const elemOrder = compConfig.resistElems;
if (!Array.isArray(elemOrder) || elemOrder.length < 8) {
  throw new Error(
    `comp-config.resistElems malformed: ${JSON.stringify(elemOrder)} - upstream schema drift?`,
  );
}
const codeCat = Object.fromEntries(
  Object.entries(compConfig.resistCodes).map(([code, value]) => [
    code,
    Math.floor(value / 10000),
  ]),
);

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const bosses = Object.entries(enemyData)
  .filter(([, data]) => / B$/.test(data.race))
  .map(([name, data]) => {
    const affinity = { weak: [], resists: [], reflects: [], absorbs: [], nullifies: [] };
    [...data.resists].forEach((char, index) => {
      const bucket = BUCKET[codeCat[char]];
      const elem = ELEM_NAME[elemOrder[index]];
      if (bucket && elem) affinity[bucket].push(elem);
    });
    return {
      name,
      query: slug(name),
      arcana: data.race.replace(/ [A-Z]$/, ""),
      level: data.lvl,
      ...affinity,
    };
  })
  .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

if (bosses.length < 40) {
  throw new Error(
    `only ${bosses.length} bosses matched the race suffix - enemy-data schema drift?`,
  );
}

writeFileSync(OUT_PATH, JSON.stringify(bosses));
console.log(`generated ${bosses.length} bosses -> public/bosses.json`);
