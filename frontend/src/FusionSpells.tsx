import { useMemo } from "react";
import type { Persona } from "./api";
import { FUSION_SPELLS } from "./theurgy";

// справочник Theurgy-«Fusion Spells» протагониста: 7 навыков, каждый от пары
// зарегистрированных персон (см. theurgy.ts)
export function FusionSpells({ personas }: { personas: Persona[] }) {
  const entries = useMemo(() => {
    const byQuery = new Map(personas.map((persona) => [persona.query, persona]));
    return FUSION_SPELLS.map((spell) => ({
      skill: spell.skill,
      a: byQuery.get(spell.a),
      b: byQuery.get(spell.b),
    })).filter(
      (entry): entry is { skill: string; a: Persona; b: Persona } =>
        entry.a !== undefined && entry.b !== undefined,
    );
  }, [personas]);

  return (
    <section className="mt-20">
      <h2 className="font-mono text-sm tracking-[0.1em] text-blood">
        THEURGY FUSION SPELLS
      </h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-mut">
        The protagonist unlocks each of these seven Theurgy skills by
        registering both personas of a pair in the Compendium.
      </p>
      <div className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2">
        {entries.map(({ skill, a, b }) => (
          <div
            key={skill}
            className="flex flex-col gap-1.5 border-b-2 border-r-2 border-ink bg-card p-4"
          >
            <span className="font-display text-lg uppercase leading-none break-words">
              {skill}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
              <a
                href={`/persona/${encodeURIComponent(a.query)}/`}
                className="hover:text-ink hover:underline"
              >
                {a.name}
              </a>
              {" × "}
              <a
                href={`/persona/${encodeURIComponent(b.query)}/`}
                className="hover:text-ink hover:underline"
              >
                {b.name}
              </a>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
