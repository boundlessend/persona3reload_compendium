import { memo } from "react";
import type { Persona } from "./api";
import { idTag } from "./constants";
import { PersonaImage } from "./PersonaImage";

export const PersonaCard = memo(function PersonaCard({
  persona,
  onSelect,
  marked,
  isFavorite,
  registered,
  onToggleRegistered,
  special,
  selecting,
}: {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  marked: boolean;
  isFavorite: boolean;
  registered: boolean;
  onToggleRegistered: (query: string) => void;
  special: boolean;
  selecting: boolean;
}) {
  return (
    // wrapper: чекбокс «собрана» - отдельная кнопка-сиблинг (кнопку в кнопку нельзя)
    <div className="relative [content-visibility:auto] [contain-intrinsic-size:auto_18rem]">
      <button
        onClick={() => onSelect(persona)}
        aria-pressed={selecting ? marked : undefined}
        className={`group flex h-full w-full flex-col border-b-2 border-r-2 border-ink bg-card p-5 text-left transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
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
          {special && (
            <span className="absolute left-0 top-0 border border-ink bg-paper px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink">
              Special
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
        <p className="font-display text-xl uppercase leading-none text-ink break-words group-hover:text-paper">
          {persona.name}
        </p>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
          {persona.arcana}
        </p>
      </button>
      <button
        type="button"
        onClick={() => onToggleRegistered(persona.query)}
        aria-pressed={registered}
        aria-label={
          registered
            ? `${persona.name}: collected`
            : `${persona.name}: mark as collected`
        }
        className={`absolute bottom-2 right-2 z-10 grid h-6 w-6 place-items-center border-2 font-mono text-xs leading-none transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
          registered
            ? "border-blood bg-blood text-paper"
            : "border-ink/40 bg-paper/80 text-transparent hover:border-ink hover:text-ink"
        }`}
      >
        ✓
      </button>
    </div>
  );
});
