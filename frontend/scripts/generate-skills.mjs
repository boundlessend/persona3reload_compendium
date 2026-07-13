// собирает public/skills.json (query -> список выученных скиллов) из данных
// проекта aqiu384/megaten-fusion-tool (движок самого используемого P3R-калькулятора):
//   skill-data.json - определения скиллов (имя, стихия, цель)
//   demon-data.json - какие скиллы учит персона и на каком уровне
// показываем имя/стихию/цель/уровень изучения; SP-стоимость и силу опускаем -
// они закодированы неоднозначно и врать на фан-сайте хуже, чем не показывать.
// запускать вручную (сетевой fetch), результат коммитим статикой.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const PERSONAS_PATH = resolve(here, "../public/personas.json");
const OUT_PATH = resolve(here, "../public/skills.json");
// запиннено на конкретный commit, чтобы билд не зависел от смены upstream;
// обновлять данные -> подставить свежий SHA ветки master вручную
const UPSTREAM_SHA = "629e89515fefe58f9e83f7d78d33883c92fa3c60";
const BASE = `https://raw.githubusercontent.com/aqiu384/megaten-fusion-tool/${UPSTREAM_SHA}/src/app/p3r/data`;

const ELEM = {
  sla: "Slash", str: "Strike", pie: "Pierce", fir: "Fire", ice: "Ice",
  ele: "Elec", win: "Wind", lig: "Light", dar: "Dark", alm: "Almighty",
  ail: "Ailment", rec: "Recovery", sup: "Support", spe: "Special",
  pas: "Passive",
};

async function fetchJson(name) {
  const response = await fetch(`${BASE}/${name}`);
  if (!response.ok) {
    throw new Error(`failed to fetch ${name}: ${response.status}`);
  }
  return response.json();
}

// снимаем диакритику, чтобы "Arsène" совпал с "Arsene" и т.п.
const norm = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const skillData = await fetchJson("skill-data.json");
const demonData = await fetchJson("demon-data.json");

// шаблоны формата эффектов лежат в общей папке compendium, не в p3r/data
const EFFECTS_URL = `https://raw.githubusercontent.com/aqiu384/megaten-fusion-tool/${UPSTREAM_SHA}/src/app/compendium/data/skill-effects.json`;
const effectsResponse = await fetch(EFFECTS_URL);
if (!effectsResponse.ok) {
  throw new Error(`failed to fetch skill-effects.json: ${effectsResponse.status}`);
}
const skillEffects = await effectsResponse.json();

// порт skillRowToEffect из upstream (pq2/models/skill-importer): собирает
// читаемый эффект из чисел (power/hits/acc/crit) и FMT-шаблонов cond -> ровно то,
// что показывает сам калькулятор. P3R: power без sqrt. SP/HP-стоимость опускаем
// (закодирована costTypes-суффиксом и вне effect-строки)
function skillRowToEffect(nums, descs) {
  const [, , power, minHits, maxHits, acc, crit, mod] = nums;
  const [effect, cond] = descs;
  const condStr = cond.startsWith("FMT") ? skillEffects[cond.substring(3)] : cond;
  const baseMod = parseInt(mod, 10);
  const powerStr = power === 0 ? "" : `${power} pwr`;
  const hitStr =
    minHits !== maxHits
      ? `${minHits}-${maxHits} hits`
      : maxHits < 2
        ? ""
        : `${maxHits} hits`;
  const critStr = crit <= 5 ? "" : `${crit}% crit`;
  const accStr = acc === 0 || (acc >= 90 && acc <= 110) ? "" : `${acc}% acc`;
  const modStr = `${baseMod < 1000 ? mod : (baseMod - 1000) / 100}`;
  const effectStr =
    cond === "-" ? "" : condStr.replace("$1", modStr).replace("$2", effect);
  const full = [powerStr, hitStr, accStr, critStr, effectStr]
    .filter((s) => s !== "")
    .join(", ");
  return full.charAt(0) === "x"
    ? full
    : full.charAt(0).toUpperCase() + full.slice(1);
}

const skillDef = {};
for (const entry of Object.values(skillData)) {
  const [name, elem, target] = entry.a;
  skillDef[name] = {
    el: ELEM[elem] ?? elem,
    tg: target,
    effect: skillRowToEffect(entry.b, entry.c),
  };
}

const demonByNorm = {};
for (const [name, data] of Object.entries(demonData)) {
  demonByNorm[norm(name)] = data;
}

const personas = JSON.parse(readFileSync(PERSONAS_PATH, "utf8"));
const out = {};
let matched = 0;
for (const persona of personas) {
  const demon = demonByNorm[norm(persona.name)];
  if (!demon) continue;
  matched += 1;
  out[persona.query] = Object.entries(demon.skills)
    .map(([name, value]) => {
      const def = skillDef[name] ?? { el: "-", tg: "-", effect: "" };
      // <1 - врождённый (стартовый); 1..99 - уровень; иначе неизвестно
      const lv = value < 1 ? 0 : value <= 99 ? value : null;
      const skill = { n: name, lv, el: def.el, tg: def.tg };
      if (def.effect) skill.e = def.effect;
      return skill;
    })
    .sort((a, b) => (a.lv ?? 999) - (b.lv ?? 999));
}

writeFileSync(OUT_PATH, JSON.stringify(out));
console.log(
  `generated skills for ${matched}/${personas.length} personas -> public/skills.json`,
);
