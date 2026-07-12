import type { Persona } from "./api";

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
