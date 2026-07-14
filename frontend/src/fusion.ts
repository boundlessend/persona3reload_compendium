import type { Persona } from "./api";

// Таблица слияния аркан Persona 3 Reload (нижнетреугольная 22x22). Источник:
// aqiu384/megaten-fusion-tool (данные самого используемого P3R-калькулятора).
// result(a,b) = TABLE[max(i,j)][min(i,j)]; "-" вне диагонали = слияния нет.
// канонический порядок аркан P3R (совпадает с треугольной TABLE ниже);
// экспортируется для матрицы слияния на /arcana
export const RACES = [
  "Fool", "Magician", "Priestess", "Empress", "Emperor", "Hierophant",
  "Lovers", "Chariot", "Justice", "Hermit", "Fortune", "Strength", "Hanged",
  "Death", "Temperance", "Devil", "Tower", "Star", "Moon", "Sun", "Judgement",
  "Aeon",
] as const;

const TABLE: string[][] = [
  ["-"],
  ["Hierophant", "-"],
  ["Magician", "Justice", "-"],
  ["Star", "Hanged", "Temperance", "-"],
  ["Temperance", "Lovers", "Justice", "Chariot", "-"],
  ["Hanged", "Hermit", "Lovers", "Tower", "Strength", "-"],
  ["Justice", "Chariot", "Magician", "Moon", "Chariot", "Magician", "-"],
  ["Emperor", "Devil", "Fool", "Hermit", "Devil", "Justice", "Priestess", "-"],
  ["Lovers", "Hierophant", "Lovers", "Emperor", "Hanged", "Fool", "Emperor", "Magician", "-"],
  ["Priestess", "Moon", "Strength", "Sun", "Hierophant", "Chariot", "Fool", "Lovers", "Magician", "-"],
  ["Strength", "Lovers", "Hanged", "Strength", "Star", "Moon", "Temperance", "Priestess", "Hanged", "Justice", "-"],
  ["Death", "Emperor", "Moon", "Fool", "Magician", "Fortune", "Hermit", "Temperance", "Star", "Emperor", "Sun", "-"],
  ["Devil", "Fool", "Hierophant", "Star", "Death", "Strength", "Justice", "Strength", "Priestess", "Temperance", "Magician", "Chariot", "-"],
  ["Fortune", "Priestess", "Justice", "Lovers", "Hermit", "Fortune", "Hanged", "Hierophant", "Hermit", "Chariot", "Star", "Empress", "Strength", "-"],
  ["Chariot", "Justice", "Fortune", "Hierophant", "Star", "Hermit", "Death", "Hermit", "Moon", "Magician", "Tower", "Moon", "Hierophant", "Devil", "-"],
  ["Hermit", "Temperance", "Emperor", "Tower", "Moon", "Priestess", "Star", "Hanged", "Temperance", "Strength", "Empress", "Lovers", "Priestess", "Tower", "Fool", "-"],
  ["Moon", "Chariot", "Empress", "Devil", "Strength", "Temperance", "Sun", "Star", "Sun", "Emperor", "Aeon", "Hanged", "Death", "Aeon", "Devil", "Judgement", "-"],
  ["Devil", "Strength", "Emperor", "Priestess", "Hierophant", "Moon", "Death", "Fortune", "Hermit", "Fool", "Magician", "Priestess", "Empress", "Sun", "Fortune", "Justice", "Judgement", "-"],
  ["Empress", "Strength", "Star", "Aeon", "Lovers", "Magician", "Empress", "Temperance", "Temperance", "Hierophant", "Death", "Devil", "Chariot", "Hanged", "Priestess", "Fool", "Fortune", "Sun", "-"],
  ["Judgement", "Empress", "Hierophant", "Emperor", "Temperance", "Tower", "Devil", "Strength", "Magician", "Star", "Judgement", "Lovers", "Aeon", "Justice", "Chariot", "Death", "Hierophant", "Justice", "Tower", "-"],
  ["Aeon", "Star", "Hanged", "Lovers", "Sun", "Emperor", "Moon", "Empress", "Fool", "Temperance", "Sun", "Devil", "Tower", "Devil", "Empress", "Death", "Aeon", "Tower", "Fortune", "Aeon", "-"],
  ["Death", "Sun", "Empress", "Priestess", "Fortune", "Sun", "Tower", "Hermit", "Judgement", "Devil", "Moon", "Fool", "Death", "-", "Justice", "Star", "Sun", "Judgement", "Judgement", "Empress", "Fool", "-"],
];

// спец-персоны: делаются только особым рецептом, обычное слияние их пропускает.
// значения - имена ингредиентов, как в игре (для показа рецепта). Ключи - query
export const SPECIAL_RECIPES: Record<string, string[]> = {
  shiva: ["Rangda", "Barong"],
  messiah: ["Orpheus", "Thanatos"],
  fortuna: ["Angel", "Silky", "Unicorn"],
  "pale-rider": ["Berith", "Gurulu", "Matador"],
  flauros: ["Forneus", "Berith", "Eligor"],
  "black-frost": ["Jack Frost", "Jack-o'-Lantern", "King Frost"],
  parvati: ["Sati", "Sarasvati", "Dakini"],
  mada: ["Hanuman", "Vasuki", "Naga Raja", "Ganesha"],
  norn: ["Clotho", "Lachesis", "Atropos"],
  alice: ["Pixie", "Lilim", "Narcissus", "Titania"],
  kohryu: ["Genbu", "Seiryu", "Suzaku", "Byakko"],
  mara: ["Incubus", "Pazuzu", "Mot", "Kumbhanda", "Attis"],
  "susano-o": ["Take-Minakata", "Take-Mikazuchi", "Okuninushi", "Shiki-Ouji", "Kikuri-Hime"],
  thanatos: ["Pisaca", "Pale Rider", "Loa", "Samael", "Mot", "Alice"],
  masakado: ["Zouchouten", "Jikokuten", "Koumokuten", "Bishamonten"],
  beelzebub: ["Incubus", "Succubus", "Pazuzu", "Lilith", "Baal Zebul", "Abaddon"],
  asura: ["Rakshasa", "Girimekhala", "Bishamonten", "Qitian Dasheng", "Atavaka", "Vishnu"],
  metatron: ["Uriel", "Raphael", "Gabriel", "Michael"],
  lucifer: ["Samael", "Abaddon", "Beelzebub", "Satan", "Helel"],
  "orpheus-telos": ["Thanatos", "Asura", "Chi You", "Metatron", "Helel", "Messiah"],
};

const SPECIAL_ONLY = new Set(Object.keys(SPECIAL_RECIPES));

// делается ли персона только особым рецептом (обычное слияние её пропускает)
export function isSpecialFusion(query: string): boolean {
  return SPECIAL_ONLY.has(query);
}

// результирующая аркана пары (null = слияния нет; для одинаковой арканы см. fuse)
export function resultArcana(a: string, b: string): string | null {
  const i = RACES.indexOf(a as (typeof RACES)[number]);
  const j = RACES.indexOf(b as (typeof RACES)[number]);
  if (i < 0 || j < 0) return null;
  const cell = TABLE[Math.max(i, j)]?.[Math.min(i, j)];
  return !cell || cell === "-" ? null : cell;
}

type FusionCtx = { byArcana: Map<string, Persona[]> };

// обычный пул: без DLC и без спец-эксклюзивов, по арканам, отсортирован по уровню
function buildCtx(personas: Persona[]): FusionCtx {
  const byArcana = new Map<string, Persona[]>();
  for (const persona of personas) {
    if (persona.dlc !== 0 || SPECIAL_ONLY.has(persona.query)) continue;
    const list = byArcana.get(persona.arcana);
    if (list) list.push(persona);
    else byArcana.set(persona.arcana, [persona]);
  }
  for (const list of byArcana.values())
    list.sort((x, y) => x.level - y.level);
  return { byArcana };
}

function fuseCtx(a: Persona, b: Persona, ctx: FusionCtx): Persona | null {
  if (a.id === b.id) return null;
  if (a.arcana === b.arcana) {
    // одинаковая аркана: высшая персона арканы (кроме самих ингредиентов) с уровнем
    // <= avg+1. правило P3R-калькулятора aqiu384 (на его данных построена таблица):
    // порог floor(avg)+1, поиск вниз, ингредиенты исключены (иначе слияние вернуло
    // бы один из них); если ничего не подходит - слияния нет. было ошибочно "< avg"
    const threshold = (a.level + b.level) / 2 + 1;
    const list = ctx.byArcana.get(a.arcana) ?? [];
    let best: Persona | null = null;
    for (const persona of list) {
      if (persona.id === a.id || persona.id === b.id) continue;
      if (persona.level <= threshold) best = persona;
    }
    return best;
  }
  const race = resultArcana(a.arcana, b.arcana);
  if (!race) return null;
  const list = ctx.byArcana.get(race) ?? [];
  const target = Math.floor((a.level + b.level) / 2) + 1;
  for (const persona of list) if (persona.level >= target) return persona;
  return list.length ? (list[list.length - 1] ?? null) : null;
}

// forward: во что сливаются две персоны (обычное слияние; null = нет результата)
export function fuseResult(
  a: Persona,
  b: Persona,
  personas: Persona[],
): Persona | null {
  return fuseCtx(a, b, buildCtx(personas));
}

export type Recipe = { a: Persona; b: Persona };

// обратный индекс за один проход O(n^2): result.id -> все обычные рецепты.
// единый источник рецептов: и плоский список в модалке, и многошаговое дерево
// читают его, чтобы не гонять O(n^2) на каждый узел/повторно
export function reverseIndex(personas: Persona[]): Map<number, Recipe[]> {
  const ctx = buildCtx(personas);
  const pool: Persona[] = [];
  for (const list of ctx.byArcana.values()) pool.push(...list);
  const index = new Map<number, Recipe[]>();
  for (let i = 0; i < pool.length; i += 1) {
    const a = pool[i];
    if (!a) continue;
    for (let j = i + 1; j < pool.length; j += 1) {
      const b = pool[j];
      if (!b) continue;
      const result = fuseCtx(a, b, ctx);
      if (!result) continue;
      const list = index.get(result.id);
      if (list) list.push({ a, b });
      else index.set(result.id, [{ a, b }]);
    }
  }
  // сортируем по МАКС уровню ингредиента (потом по сумме): балансные пары выше
  // перекошенных, чтобы цепочка строилась снизу вверх и не гоняла через персону
  // выше цели (напр. Thoth 40 из двух ~39, а не из Futsunushi 74 + Angel 4)
  for (const list of index.values())
    list.sort((x, y) => {
      const byMax =
        Math.max(x.a.level, x.b.level) - Math.max(y.a.level, y.b.level);
      return byMax !== 0
        ? byMax
        : x.a.level + x.b.level - (y.a.level + y.b.level);
    });
  return index;
}
