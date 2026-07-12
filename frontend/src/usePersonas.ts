import { useEffect, useState } from "react";
import { fetchPersonas, type Persona } from "./api";

// загрузка статического справочника персон; общий хук для всех страниц
export function usePersonas(): {
  personas: Persona[];
  loading: boolean;
  error: string | null;
} {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchPersonas(controller.signal)
      .then(setPersonas)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return { personas, loading, error };
}
