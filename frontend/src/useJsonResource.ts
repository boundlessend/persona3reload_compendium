import { useEffect, useState } from "react";

// общий загрузчик статического same-origin JSON: AbortController, проверка res.ok,
// валидация формы на границе доверия (parse бросает на кривой форме и возвращает
// типизированные данные), состояния loading/error. единый источник для
// personas/skills/bosses/requests - раньше это был копипаст в четырёх хуках.
// parse обязателен и должен быть стабильной (модульной) функцией: он в deps эффекта
export function useJsonResource<T>(
  url: string,
  initial: T,
  parse: (data: unknown) => T,
): { data: T; loading: boolean; error: string | null } {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`${url} ${response.status}`);
        return response.json() as Promise<unknown>;
      })
      .then((raw) => setData(parse(raw)))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url, parse]);

  return { data, loading, error };
}
