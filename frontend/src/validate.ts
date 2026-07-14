// общие предикаты для валидации формы JSON-датасетов на границе доверия
// (personas/skills/bosses/requests). чистые, без React - используют и парсеры,
// и api.ts

// объект-словарь (не null и не массив)
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// массив строк (аффинити-бакеты персон и боссов)
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
