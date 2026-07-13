// Theurgy-«Fusion Spells» протагониста P3R: каждый навык разблокируется, когда
// обе персоны пары зарегистрированы в компендиуме. Ровно 7 связок (полный
// список). Данные сверены по 2+ источникам (Dexerto, Samurai Gamers и др.).
// Персоны заданы через query - все 14 присутствуют в personas.json.
export type FusionSpell = { skill: string; a: string; b: string };

export const FUSION_SPELLS: FusionSpell[] = [
  { skill: "Jack Brothers", a: "jack-frost", b: "jack-o-lantern" },
  { skill: "Cadenza", a: "orpheus", b: "apsaras" },
  { skill: "King and I", a: "black-frost", b: "king-frost" },
  { skill: "Scarlet Havoc", a: "siegfried", b: "mithras" },
  { skill: "Trickster", a: "susano-o", b: "loki" },
  { skill: "Best Friends", a: "forneus", b: "decarabia" },
  { skill: "Armageddon", a: "helel", b: "satan" },
];

// связка Theurgy для персоны (по query): навык + query второй персоны пары
export function theurgyFor(
  query: string,
): { skill: string; partner: string } | null {
  for (const spell of FUSION_SPELLS) {
    if (spell.a === query) return { skill: spell.skill, partner: spell.b };
    if (spell.b === query) return { skill: spell.skill, partner: spell.a };
  }
  return null;
}
