import { useState, type ReactNode } from "react";
import type { Persona } from "./api";
import type { Skill } from "./useSkills";
import { PersonaModal } from "./PersonaModal";

// общая обвязка модалки персоны для вторичных страниц (арканы, скиллы): хранит
// выбранную персону и рендерит PersonaModal. закрытие локальное, без History -
// в отличие от главной, где маршрутизация идёт через usePersonaRouting
export function usePersonaModal(
  personas: Persona[],
  skills: Record<string, Skill[]>,
  favorites: Set<string>,
  toggleFavorite: (query: string) => void,
): { open: (persona: Persona) => void; modal: ReactNode } {
  const [selected, setSelected] = useState<Persona | null>(null);
  const modal = selected ? (
    <PersonaModal
      persona={selected}
      personas={personas}
      skills={skills[selected.query] ?? null}
      onClose={() => setSelected(null)}
      isFavorite={favorites.has(selected.query)}
      onToggleFavorite={toggleFavorite}
    />
  ) : null;
  return { open: setSelected, modal };
}
