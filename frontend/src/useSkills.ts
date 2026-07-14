import { useJsonResource } from "./useJsonResource";
import { isRecord } from "./validate";

// выученный скилл персоны: имя, уровень изучения (0 = врождённый, null = особый),
// стихия/тип, цель и эффект (порт из upstream, см. scripts/generate-skills.mjs).
// e опционален - у пары скиллов эффект-строка пустая
export type Skill = {
  n: string;
  lv: number | null;
  el: string;
  tg: string;
  e?: string;
};

// полная проверка формы: словарь query -> массив скиллов, каждый с валидными
// полями (UI дереференсит n/lv/el/tg/e)
function parseSkills(data: unknown): Record<string, Skill[]> {
  if (!isRecord(data)) {
    throw new Error("malformed skills.json: expected an object");
  }
  for (const list of Object.values(data)) {
    if (!Array.isArray(list)) {
      throw new Error("malformed skills.json: expected skill arrays");
    }
    for (const skill of list) {
      if (
        !isRecord(skill) ||
        typeof skill.n !== "string" ||
        (skill.lv !== null && typeof skill.lv !== "number") ||
        typeof skill.el !== "string" ||
        typeof skill.tg !== "string" ||
        (skill.e !== undefined && typeof skill.e !== "string")
      ) {
        throw new Error("malformed skills.json: unexpected skill shape");
      }
    }
  }
  return data as Record<string, Skill[]>;
}

// загрузка каталога скиллов по персонам; error поднимаем для страницы /skills,
// где скиллы - основной контент. В PersonaModal это доп-слой: там error игнорят
export function useSkills(): {
  skills: Record<string, Skill[]>;
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useJsonResource<Record<string, Skill[]>>(
    "/skills.json",
    {},
    parseSkills,
  );
  return { skills: data, loading, error };
}
