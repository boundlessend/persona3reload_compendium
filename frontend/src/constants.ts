import { STAT_KEYS } from "./api";
import type { Persona, StatKey } from "./api";

export type AffinityKey =
  | "weak"
  | "resists"
  | "reflects"
  | "absorbs"
  | "nullifies";

export const AFFINITIES: { key: AffinityKey; label: string; tone: string }[] = [
  { key: "weak", label: "Weak", tone: "bg-blood text-paper" },
  { key: "resists", label: "Resists", tone: "bg-ink text-paper" },
  { key: "reflects", label: "Reflects", tone: "border border-ink text-ink" },
  { key: "absorbs", label: "Absorbs", tone: "bg-mut text-paper" },
  { key: "nullifies", label: "Nulls", tone: "border border-ink/40 text-mut" },
];

export const AFFINITY_KEYS: readonly AffinityKey[] = AFFINITIES.map(
  (item) => item.key,
);

export const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  magic: "Magic",
  endurance: "Endurance",
  agility: "Agility",
  luck: "Luck",
};

export const AFFINITY_FILTER_LABELS: Record<AffinityKey, string> = {
  weak: "Weak to",
  resists: "Resists",
  reflects: "Reflects",
  absorbs: "Absorbs",
  nullifies: "Nullifies",
};

export type SortKey = "id" | "level" | "name" | "arcana" | StatKey;

// сортировки по статам генерятся из STAT_KEYS (по убыванию: сильнейшие сверху)
const STAT_SORT_LABELS = Object.fromEntries(
  STAT_KEYS.map((key) => [key, `${STAT_LABELS[key]} ↓`]),
) as Record<StatKey, string>;

const STAT_SORTERS = Object.fromEntries(
  STAT_KEYS.map((key) => [key, (a: Persona, b: Persona) => b[key] - a[key]]),
) as Record<StatKey, (a: Persona, b: Persona) => number>;

export const SORT_LABELS: Record<SortKey, string> = {
  id: "Default",
  level: "Level",
  name: "Name",
  arcana: "Arcana",
  ...STAT_SORT_LABELS,
};

export const SORTERS: Record<SortKey, (a: Persona, b: Persona) => number> = {
  id: (a, b) => a.id - b.id,
  level: (a, b) => a.level - b.level,
  name: (a, b) => a.name.localeCompare(b.name),
  arcana: (a, b) => a.arcana.localeCompare(b.arcana) || a.level - b.level,
  ...STAT_SORTERS,
};

export type DlcFilter = "all" | "base" | "dlc" | "special";

export const idTag = (id: number): string => `№${String(id).padStart(3, "0")}`;

// декодирует сегмент query из URL; на битом percent-encoding возвращает null
export function decodeQuery(raw: string): string | null {
  try {
    return decodeURIComponent(raw);
  } catch {
    return null;
  }
}

// персон по арканам в порядке первого появления в списке
export function countByArcana(
  personas: Persona[],
): { arcana: string; count: number }[] {
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const persona of personas) {
    if (!counts.has(persona.arcana)) order.push(persona.arcana);
    counts.set(persona.arcana, (counts.get(persona.arcana) ?? 0) + 1);
  }
  return order.map((arcana) => ({ arcana, count: counts.get(arcana) ?? 0 }));
}
