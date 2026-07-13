import { useEffect, useState } from "react";
import type { AffinityKey } from "./constants";

// story-босс P3R со слабостями/резистами (те же бакеты, что аффинити персон).
// данные из public/bosses.json (см. scripts/generate-bosses.mjs)
export type Boss = { name: string; query: string; arcana: string; level: number } & Record<
  AffinityKey,
  string[]
>;

// загрузка справочника боссов; error поднимаем для страницы /bosses
export function useBosses(): {
  bosses: Boss[];
  loading: boolean;
  error: string | null;
} {
  const [bosses, setBosses] = useState<Boss[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/bosses.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`bosses.json ${response.status}`);
        return response.json();
      })
      .then((data: unknown) => {
        if (Array.isArray(data)) setBosses(data as Boss[]);
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

  return { bosses, loading, error };
}
