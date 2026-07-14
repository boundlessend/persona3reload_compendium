import { isRecord, isStringArray } from "./validate";

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
  origin: string;
};

// полная проверка формы на границе доверия: personas.json генерится на билде, но
// тип Persona[] без рантайм-контроля - фикция. валидируем все поля, которые UI
// дереференсит (статы, аффинити-массивы), а не только имя/аркану
export function parsePersonas(data: unknown): Persona[] {
  if (!Array.isArray(data)) {
    throw new Error("malformed personas.json: expected an array");
  }
  for (const item of data) {
    if (
      !isRecord(item) ||
      typeof item.id !== "number" ||
      typeof item.level !== "number" ||
      typeof item.dlc !== "number" ||
      typeof item.strength !== "number" ||
      typeof item.magic !== "number" ||
      typeof item.endurance !== "number" ||
      typeof item.agility !== "number" ||
      typeof item.luck !== "number" ||
      typeof item.name !== "string" ||
      typeof item.arcana !== "string" ||
      typeof item.query !== "string" ||
      typeof item.origin !== "string" ||
      typeof item.image !== "string" ||
      typeof item.description !== "string" ||
      !isStringArray(item.weak) ||
      !isStringArray(item.resists) ||
      !isStringArray(item.reflects) ||
      !isStringArray(item.absorbs) ||
      !isStringArray(item.nullifies)
    ) {
      throw new Error("malformed personas.json: unexpected persona shape");
    }
  }
  return data as Persona[];
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

// Fallback count shown before data loads; generated from
// frontend/data/compendium.tsv so it cannot drift from the data.
export { PERSONA_COUNT } from "./generated-meta";
