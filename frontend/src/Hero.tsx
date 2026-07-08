import type { Persona } from "./api";
import { PERSONA_COUNT } from "./api";
import { ARCANA_COUNT } from "./generated-meta";
import { AFFINITIES } from "./constants";

export function Hero({
  personas,
  arcanaCount,
}: {
  personas: Persona[];
  arcanaCount: number;
}) {
  const count = personas.length || PERSONA_COUNT;
  return (
    <section id="top" className="border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-end gap-8 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-20">
          <div>
            <p className="font-mono text-sm tracking-[0.1em] text-blood">
              FIG. 001 / {count} PERSONAS / THE FULL RECORD
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,15vw,3.75rem)] uppercase leading-[0.84] tracking-tight md:text-8xl">
              Memento
              <br />
              <span className="text-blood">Mori.</span>
            </h1>
            <a
              href="#browse"
              className="mt-8 inline-block bg-blood px-8 py-4 font-mono text-sm uppercase tracking-widest text-paper transition hover:bg-ink"
            >
              Open the record →
            </a>
          </div>
          <p className="max-w-sm pb-2 leading-relaxed text-mut md:text-right">
            The full Persona 3 Reload compendium, mirrored. All {count} personas
            catalogued: arcana, stats and elemental affinities, set in ink.
          </p>
        </div>
        <div className="flex border-t-2 border-ink">
          {(
            [
              [count, "Personas"],
              [arcanaCount || ARCANA_COUNT, "Arcana"],
              [AFFINITIES.length, "Affinities"],
            ] as [number, string][]
          ).map(([value, label], index) => (
            <div
              key={label}
              className={`flex-1 py-5 ${index > 0 ? "pl-6" : ""} ${index < 2 ? "border-r-2 border-ink" : ""}`}
            >
              <div className="font-display text-4xl leading-none">
                {String(value).padStart(2, "0")}
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-widest text-mut">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
