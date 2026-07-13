import { useEffect, useState } from "react";

export type RequestType = "item" | "money" | "skill-card" | "key-unlock";

// запрос Элизабет из Велвет-рума P3R: номер, задача, награда, тип, опц. дедлайн
// и флаг missable. данные курированы из гайдов (см. public/requests.json)
export type EliRequest = {
  n: number;
  task: string;
  reward: string;
  type: RequestType;
  deadline?: string;
  missable?: boolean;
  skill?: string;
};

// загрузка справочника запросов Элизабет; error поднимаем для страницы /requests
export function useRequests(): {
  requests: EliRequest[];
  loading: boolean;
  error: string | null;
} {
  const [requests, setRequests] = useState<EliRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/requests.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`requests.json ${response.status}`);
        return response.json();
      })
      .then((data: unknown) => {
        if (!Array.isArray(data)) {
          throw new Error("malformed requests.json: expected an array");
        }
        setRequests(data as EliRequest[]);
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

  return { requests, loading, error };
}
