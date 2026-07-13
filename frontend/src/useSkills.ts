import { useEffect, useState } from "react";

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

// загрузка каталога скиллов по персонам; error поднимаем для страницы /skills,
// где скиллы - основной контент. В PersonaModal это доп-слой: там error игнорят
export function useSkills(): {
  skills: Record<string, Skill[]>;
  loading: boolean;
  error: string | null;
} {
  const [skills, setSkills] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/skills.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`skills.json ${response.status}`);
        return response.json();
      })
      .then((data: unknown) => {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("malformed skills.json: expected an object");
        }
        setSkills(data as Record<string, Skill[]>);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { skills, loading, error };
}
