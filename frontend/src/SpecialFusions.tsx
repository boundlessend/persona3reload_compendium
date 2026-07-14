import { useMemo } from "react";
import type { Persona } from "./api";
import { SPECIAL_RECIPES } from "./fusion";

// справочник спец-рецептов: персоны, которые делаются только фиксированным
// многокомпонентным рецептом (обычное слияние их не даёт)
export function SpecialFusions({ personas }: { personas: Persona[] }) {
  const entries = useMemo(() => {
    const byQuery = new Map(personas.map((persona) => [persona.query, persona]));
    return Object.entries(SPECIAL_RECIPES)
      .map(([query, ingredients]) => ({
        persona: byQuery.get(query),
        ingredients,
      }))
      .filter(
        (entry): entry is { persona: Persona; ingredients: string[] } =>
          entry.persona !== undefined,
      )
      .sort((a, b) => a.persona.level - b.persona.level);
  }, [personas]);

  return (
    <section className="mt-20">
      <h2 className="font-mono text-sm tracking-[0.1em] text-blood">
        SPECIAL FUSIONS
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-mut">
        Personas that only come from a fixed multi-ingredient recipe. Normal
        fusion never produces them.
      </p>
      <div className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2">
        {entries.map(({ persona, ingredients }) => (
          <a
            key={persona.query}
            href={`/persona/${encodeURIComponent(persona.query)}/`}
            className="group flex flex-col gap-1.5 border-b-2 border-r-2 border-ink bg-card p-4 transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
          >
            <span className="font-display text-lg uppercase leading-none break-words">
              {persona.name}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
              {ingredients.join(" × ")}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
