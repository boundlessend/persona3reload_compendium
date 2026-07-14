import { useMemo, useState, type ReactNode } from "react";
import type { Persona } from "./api";
import type { Skill } from "./useSkills";
import { reverseIndex } from "./fusion";
import { PersonaModal } from "./PersonaModal";

// общая обвязка модалки персоны для вторичных страниц (арканы, скиллы): хранит
// выбранную персону и рендерит PersonaModal. закрытие локальное, без History -
// в отличие от главной, где маршрутизация идёт через usePersonaRouting
export function usePersonaModal(
  personas: Persona[],
  skills: Record<string, Skill[]>,
  favorites: Set<string>,
  toggleFavorite: (query: string) => void,
  registered: Set<string>,
  toggleRegistered: (query: string) => void,
): { open: (persona: Persona) => void; modal: ReactNode } {
  const [selected, setSelected] = useState<Persona | null>(null);
  // индекс живёт на уровне хука (страницы), а не модалки, чтобы не пересчитываться
  // на каждое открытие (см. PersonaModal.reverseIdx)
  const reverseIdx = useMemo(() => reverseIndex(personas), [personas]);
  const modal = selected ? (
    <PersonaModal
      persona={selected}
      personas={personas}
      reverseIdx={reverseIdx}
      skills={skills[selected.query] ?? null}
      onClose={() => setSelected(null)}
      isFavorite={favorites.has(selected.query)}
      onToggleFavorite={toggleFavorite}
      isRegistered={registered.has(selected.query)}
      onToggleRegistered={toggleRegistered}
      registered={registered}
    />
  ) : null;
  const open = (persona: Persona): void => setSelected(persona);
  return { open, modal };
}
