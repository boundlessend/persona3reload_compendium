import type { Persona } from "./api";
import type { Skill } from "./useSkills";

// стихии, наносящие урон (по ним считаем наступательное покрытие); Support /
// Recovery / Passive / Ailment - не урон
const DAMAGE_ELEMENTS = [
  "Slash",
  "Strike",
  "Pierce",
  "Fire",
  "Ice",
  "Elec",
  "Wind",
  "Light",
  "Dark",
  "Almighty",
] as const;

export type OffenseRow = { element: string; by: string[] };

// наступательный разбор: для каждой урон-стихии - кто из команды умеет ей бить.
// пустой by = дыра в покрытии (команда не может ударить по этой слабости)
export function teamOffense(
  team: Persona[],
  skills: Record<string, Skill[]>,
): OffenseRow[] {
  return DAMAGE_ELEMENTS.map((element) => ({
    element,
    by: team
      .filter((persona) =>
        (skills[persona.query] ?? []).some((skill) => skill.el === element),
      )
      .map((persona) => persona.name),
  }));
}

// affinity-статусы, снимающие урон (в отличие от weak); reflects/absorbs даже
// обращают его в пользу, но для защитного разбора все четыре = "прикрыто"
const DEFENSIVE_KEYS = ["resists", "reflects", "absorbs", "nullifies"] as const;

export type ElementRow = {
  element: string;
  weak: string[]; // имена членов команды, слабых к стихии
  covered: string[]; // имена, что резистят/нуллят/поглощают/отражают стихию
};

// защитный разбор команды по стихиям: считается только из affinity-данных,
// без скиллов (наступательное покрытие появится вместе с данными о скиллах)
export function teamCoverage(team: Persona[]): ElementRow[] {
  const universe = new Set<string>();
  for (const persona of team) {
    for (const element of persona.weak) universe.add(element);
    for (const key of DEFENSIVE_KEYS)
      for (const element of persona[key]) universe.add(element);
  }
  return Array.from(universe)
    .sort()
    .map((element) => ({
      element,
      weak: team.filter((p) => p.weak.includes(element)).map((p) => p.name),
      covered: team
        .filter((p) => DEFENSIVE_KEYS.some((key) => p[key].includes(element)))
        .map((p) => p.name),
    }));
}
