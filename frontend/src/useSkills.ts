import { useEffect, useState } from "react";

// выученный скилл персоны: имя, уровень изучения (0 = врождённый, null = особый),
// стихия/тип и цель. Данные из public/skills.json (см. scripts/generate-skills.mjs)
export type Skill = { n: string; lv: number | null; el: string; tg: string };

// загрузка каталога скиллов по персонам; это доп-слой, при сбое деградируем молча
// в лог (скиллы - улучшение, а не критичный путь)
export function useSkills(): {
  skills: Record<string, Skill[]>;
  loading: boolean;
} {
  const [skills, setSkills] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/skills.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`skills.json ${response.status}`);
        return response.json();
      })
      .then((data: unknown) => {
        if (data && typeof data === "object") {
          setSkills(data as Record<string, Skill[]>);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) console.error("skills load failed", err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { skills, loading };
}
