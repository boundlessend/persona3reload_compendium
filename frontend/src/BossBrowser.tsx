import { useMemo, useState } from "react";
import { useBosses } from "./useBosses";
import { AFFINITIES } from "./constants";
import { ErrorNote } from "./ErrorNote";
import { Chip } from "./Controls";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// стихия скилла отличается от аффинити персон только для Electric ("Elec" в
// каталоге скиллов) - переводим для counter-ссылки на /skills
const skillElement = (element: string): string =>
  element === "Electric" ? "Elec" : element;

// страница /bosses/: story-боссы P3R со слабостями/резистами. слабость - это и
// есть «как контрить»: чип weak ведёт на /skills, отфильтрованный по стихии
export function BossBrowser() {
  const { bosses, loading, error } = useBosses();
  const [weakTo, setWeakTo] = useState("All");

  const weaknessElements = useMemo(
    () => Array.from(new Set(bosses.flatMap((boss) => boss.weak))).sort(),
    [bosses],
  );
  const visible = useMemo(
    () => (weakTo === "All" ? bosses : bosses.filter((boss) => boss.weak.includes(weakTo))),
    [bosses, weakTo],
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-sm tracking-[0.1em] text-blood">
          P3R BOSSES
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
          Bosses
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-mut">
          Story bosses of Persona 3 Reload with their elemental weaknesses and
          resistances. Exploit a weakness: each weak element links to the skills
          that hit it. Data mirrored from the aqiu384 fusion tool.
        </p>

        {error ? (
          <ErrorNote message={`Could not load bosses: ${error}.`} />
        ) : loading ? (
          <p className="mt-12 font-mono text-xs uppercase tracking-wider text-mut">
            Loading…
          </p>
        ) : (
          <>
            <div className="mt-10 flex flex-col gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
                Weak to
              </span>
              <div className="flex flex-wrap gap-2">
                {["All", ...weaknessElements].map((element) => (
                  <Chip
                    key={element}
                    pressed={weakTo === element}
                    onClick={() => setWeakTo(element)}
                    className="px-3 text-xs"
                  >
                    {element}
                  </Chip>
                ))}
              </div>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-wider text-mut">
              {visible.length} of {bosses.length} bosses
            </p>
            <div className="mt-4 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((boss) => {
                const hasAny = AFFINITIES.some(({ key }) => boss[key].length);
                return (
                  <div key={boss.query} className="flex flex-col bg-card p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-display text-lg uppercase leading-none break-words">
                        {boss.name}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-blood">
                        Lv {boss.level}
                      </span>
                    </div>
                    <span className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mut">
                      {boss.arcana}
                    </span>
                    <div className="mt-3 space-y-1.5">
                      {AFFINITIES.map(({ key, label, tone }) => {
                        const values = boss[key];
                        if (!values.length) return null;
                        return (
                          <div
                            key={label}
                            className="flex flex-wrap items-center gap-x-2 gap-y-1"
                          >
                            <span className="w-14 shrink-0 font-mono text-[10px] uppercase tracking-wider text-mut">
                              {label}
                            </span>
                            {values.map((element) =>
                              key === "weak" ? (
                                <a
                                  key={element}
                                  href={`/skills/?element=${skillElement(element)}`}
                                  className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wide underline decoration-paper/40 underline-offset-2 transition hover:decoration-paper ${tone}`}
                                >
                                  {element}
                                </a>
                              ) : (
                                <span
                                  key={element}
                                  className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${tone}`}
                                >
                                  {element}
                                </span>
                              ),
                            )}
                          </div>
                        );
                      })}
                      {!hasAny && (
                        <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
                          No notable affinities
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
