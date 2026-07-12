import { useMemo } from "react";
import { STAT_KEYS, type Persona } from "./api";
import { STAT_LABELS, countByArcana } from "./constants";
import { Bar } from "./Bar";

const LEVEL_BANDS = [
  { label: "1-20", min: 1, max: 20 },
  { label: "21-40", min: 21, max: 40 },
  { label: "41-60", min: 41, max: 60 },
  { label: "61-80", min: 61, max: 80 },
  { label: "81-99", min: 81, max: 99 },
];

// дашборд-секция из уже готовых чисел: персон по арканам, разброс по уровням,
// лидеры по каждой стате (кликабельны)
export function StatsSection({
  personas,
  onSelect,
}: {
  personas: Persona[];
  onSelect: (persona: Persona) => void;
}) {
  const stats = useMemo(() => {
    if (!personas.length) return null;
    const perArcana = countByArcana(personas).sort((a, b) => b.count - a.count);
    const levelSpread = LEVEL_BANDS.map((band) => ({
      label: band.label,
      count: personas.filter((p) => p.level >= band.min && p.level <= band.max)
        .length,
    }));
    const statLeaders = STAT_KEYS.map((stat) => ({
      stat,
      persona: personas.reduce((top, p) => (p[stat] > top[stat] ? p : top)),
    }));
    return {
      perArcana,
      maxArcana: perArcana[0]?.count ?? 1,
      levelSpread,
      maxBand: Math.max(...levelSpread.map((b) => b.count), 1),
      statLeaders,
    };
  }, [personas]);

  if (!stats) return null;

  return (
    <section id="stats" className="border-t-2 border-ink">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-[clamp(2.25rem,11vw,3rem)] uppercase leading-none tracking-tight">
          By the numbers
        </h2>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Personas per arcana
            </h3>
            <div className="mt-4 space-y-2">
              {stats.perArcana.map(({ arcana, count }) => (
                <div
                  key={arcana}
                  className="grid grid-cols-[5rem_1fr_2rem] items-center gap-3"
                >
                  <span className="truncate font-mono text-[10px] uppercase tracking-wider text-mut">
                    {arcana}
                  </span>
                  <Bar pct={(count / stats.maxArcana) * 100} tone="bg-ink" />
                  <span className="text-right font-mono text-[10px] text-ink">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
                Level spread
              </h3>
              <div className="mt-4 space-y-2">
                {stats.levelSpread.map(({ label, count }) => (
                  <div
                    key={label}
                    className="grid grid-cols-[3.5rem_1fr_2rem] items-center gap-3"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-wider text-mut">
                      Lv {label}
                    </span>
                    <Bar pct={(count / stats.maxBand) * 100} tone="bg-blood" />
                    <span className="text-right font-mono text-[10px] text-ink">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
                Stat leaders
              </h3>
              <div className="mt-4 space-y-1">
                {stats.statLeaders.map(({ stat, persona }) => (
                  <button
                    key={stat}
                    onClick={() => onSelect(persona)}
                    className="flex w-full items-baseline justify-between gap-3 border-b border-ink/20 py-2 text-left font-mono text-xs uppercase tracking-wider transition hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                  >
                    <span className="text-mut">{STAT_LABELS[stat]}</span>
                    <span className="min-w-0 truncate text-ink">
                      {persona.name}
                      <span className="text-blood"> · {persona[stat]}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
