import { memo } from "react";
import type { Persona } from "./api";
import { idTag } from "./constants";
import { PersonaImage } from "./PersonaImage";

export const PersonaCard = memo(function PersonaCard({
  persona,
  onSelect,
  marked,
  isFavorite,
  compareMode,
}: {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  marked: boolean;
  isFavorite: boolean;
  compareMode: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(persona)}
      aria-pressed={compareMode ? marked : undefined}
      className={`group relative flex flex-col border-b-2 border-r-2 border-ink bg-card p-5 text-left transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
        marked ? "outline outline-[3px] -outline-offset-[3px] outline-blood" : ""
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-blood group-hover:text-[#ff8a9b]">
          {idTag(persona.id)}
        </span>
        <span className="text-mut group-hover:text-paper2">
          LV {persona.level}
        </span>
      </div>
      <div className="relative my-3 grid h-36 place-items-center">
        <PersonaImage
          persona={persona}
          className="h-32 object-contain mix-blend-multiply transition group-hover:mix-blend-normal"
        />
        {persona.dlc === 1 && (
          <span className="absolute right-0 top-0 bg-blood px-2 py-0.5 font-mono text-[10px] tracking-wider text-paper">
            DLC
          </span>
        )}
        {isFavorite && (
          <span
            className="absolute bottom-0 right-0 text-lg leading-none text-blood group-hover:text-paper"
            aria-label="Favorite"
          >
            ★
          </span>
        )}
      </div>
      <p className="font-display text-xl uppercase leading-none text-ink group-hover:text-paper">
        {persona.name}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
        {persona.arcana}
      </p>
    </button>
  );
});
