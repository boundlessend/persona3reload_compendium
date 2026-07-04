export type Persona = {
  id: number;
  name: string;
  arcana: string;
  level: number;
  description: string;
  image: string;
  strength: number;
  magic: number;
  endurance: number;
  agility: number;
  luck: number;
  weak: string[];
  resists: string[];
  reflects: string[];
  absorbs: string[];
  nullifies: string[];
  dlc: number;
  query: string;
};

// узкая проверка формы данных на границе доверия: personas.json генерится на
// билде, но тип Promise<Persona[]> без рантайм-контроля - фикция
function assertPersonas(data: unknown): asserts data is Persona[] {
  if (!Array.isArray(data)) {
    throw new Error("Malformed personas.json: expected an array");
  }
  for (const item of data) {
    if (
      typeof item !== "object" ||
      item === null ||
      typeof (item as Persona).id !== "number" ||
      typeof (item as Persona).name !== "string" ||
      typeof (item as Persona).query !== "string" ||
      typeof (item as Persona).arcana !== "string"
    ) {
      throw new Error("Malformed personas.json: unexpected persona shape");
    }
  }
}

export async function fetchPersonas(signal: AbortSignal): Promise<Persona[]> {
  // статический справочник, собираемый из TSV на этапе сборки (см.
  // frontend/scripts/generate-personas.mjs) - рантайм-бэкенд не нужен
  const response = await fetch("/personas.json", { signal });
  if (!response.ok) {
    throw new Error(`Failed to load personas: ${response.status}`);
  }
  const data: unknown = await response.json();
  assertPersonas(data);
  return data;
}

export const STAT_KEYS = [
  "strength",
  "magic",
  "endurance",
  "agility",
  "luck",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

// stats are normalized to this cap when rendered as bars
export const MAX_STAT = 99;

// Fallback count shown before data loads; mirrors the row count in
// frontend/data/compendium.tsv.
export const PERSONA_COUNT = 213;
