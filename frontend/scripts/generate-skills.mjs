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
const BASE =
  "https://raw.githubusercontent.com/aqiu384/megaten-fusion-tool/master/src/app/p3r/data";

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

const skillDef = {};
for (const entry of Object.values(skillData)) {
  const [name, elem, target] = entry.a;
  skillDef[name] = { el: ELEM[elem] ?? elem, tg: target };
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
      const def = skillDef[name] ?? { el: "-", tg: "-" };
      // <1 - врождённый (стартовый); 1..99 - уровень; иначе неизвестно
      const lv = value < 1 ? 0 : value <= 99 ? value : null;
      return { n: name, lv, el: def.el, tg: def.tg };
    })
    .sort((a, b) => (a.lv ?? 999) - (b.lv ?? 999));
}

writeFileSync(OUT_PATH, JSON.stringify(out));
console.log(
  `generated skills for ${matched}/${personas.length} personas -> public/skills.json`,
);
