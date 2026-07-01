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

export async function fetchPersonas(signal: AbortSignal): Promise<Persona[]> {
  // статический справочник, собираемый из TSV на этапе сборки (см.
  // frontend/scripts/generate-personas.mjs) - рантайм-бэкенд не нужен
  const response = await fetch("/personas.json", { signal });
  if (!response.ok) {
    throw new Error(`Failed to load personas: ${response.status}`);
  }
  return response.json();
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

// Fallback count shown before the API responds; mirrors the row count in
// backend/docs/compendium.tsv.
export const PERSONA_COUNT = 213;
