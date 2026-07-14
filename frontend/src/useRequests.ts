import { useJsonResource } from "./useJsonResource";
import { isRecord } from "./validate";

export type RequestType = "item" | "money" | "skill-card" | "key-unlock";

const REQUEST_TYPES: readonly RequestType[] = [
  "item",
  "money",
  "skill-card",
  "key-unlock",
];

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

// полная проверка формы: массив запросов, у каждого номер/задача/награда и тип из
// известного union; опциональные deadline/missable/skill проверяем по наличию
function parseRequests(data: unknown): EliRequest[] {
  if (!Array.isArray(data)) {
    throw new Error("malformed requests.json: expected an array");
  }
  for (const item of data) {
    if (
      !isRecord(item) ||
      typeof item.n !== "number" ||
      typeof item.task !== "string" ||
      typeof item.reward !== "string" ||
      typeof item.type !== "string" ||
      !REQUEST_TYPES.includes(item.type as RequestType) ||
      (item.deadline !== undefined && typeof item.deadline !== "string") ||
      (item.missable !== undefined && typeof item.missable !== "boolean") ||
      (item.skill !== undefined && typeof item.skill !== "string")
    ) {
      throw new Error("malformed requests.json: unexpected request shape");
    }
  }
  return data as EliRequest[];
}

// загрузка справочника запросов Элизабет; error поднимаем для страницы /requests
export function useRequests(): {
  requests: EliRequest[];
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useJsonResource<EliRequest[]>(
    "/requests.json",
    [],
    parseRequests,
  );
  return { requests: data, loading, error };
}
