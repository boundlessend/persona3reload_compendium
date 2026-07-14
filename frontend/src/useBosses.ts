import type { AffinityKey } from "./constants";
import { useJsonResource } from "./useJsonResource";
import { isRecord, isStringArray } from "./validate";

// story-босс P3R со слабостями/резистами (те же бакеты, что аффинити персон).
// данные из public/bosses.json (см. scripts/generate-bosses.mjs)
export type Boss = { name: string; query: string; arcana: string; level: number } & Record<
  AffinityKey,
  string[]
>;

// полная проверка формы: массив боссов, у каждого имя/query/аркана/уровень и все
// пять аффинити-массивов (BossBrowser читает boss.weak.length и т.п.)
function parseBosses(data: unknown): Boss[] {
  if (!Array.isArray(data)) {
    throw new Error("malformed bosses.json: expected an array");
  }
  for (const item of data) {
    if (
      !isRecord(item) ||
      typeof item.name !== "string" ||
      typeof item.query !== "string" ||
      typeof item.arcana !== "string" ||
      typeof item.level !== "number" ||
      !isStringArray(item.weak) ||
      !isStringArray(item.resists) ||
      !isStringArray(item.reflects) ||
      !isStringArray(item.absorbs) ||
      !isStringArray(item.nullifies)
    ) {
      throw new Error("malformed bosses.json: unexpected boss shape");
    }
  }
  return data as Boss[];
}

// загрузка справочника боссов; error поднимаем для страницы /bosses
export function useBosses(): {
  bosses: Boss[];
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useJsonResource<Boss[]>(
    "/bosses.json",
    [],
    parseBosses,
  );
  return { bosses: data, loading, error };
}
