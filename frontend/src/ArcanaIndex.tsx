import { useMemo } from "react";
import { usePersonas } from "./usePersonas";
import { countByArcana } from "./constants";
import { ARCANA_GUIDE } from "./arcanaGuide";
import { ErrorNote } from "./ErrorNote";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// страница /arcana/: все 22 арканы карточками со ссылкой на детальную страницу
export function ArcanaIndex() {
  const { personas, loading, error } = usePersonas();
  const arcanaCounts = useMemo(() => countByArcana(personas), [personas]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-sm tracking-[0.1em] text-blood">
          THE 22 ARCANA
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
          The Arcana
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-mut">
          Every persona belongs to an arcana of the Major Arcana, each tied to a
          Social Link in Persona 3 Reload. Pick one to read its bond and browse
          its personas.
        </p>

        {error ? (
          <ErrorNote message={`Could not load personas: ${error}.`} />
        ) : loading ? (
          <p className="mt-12 font-mono text-xs uppercase tracking-wider text-mut">
            Loading…
          </p>
        ) : (
          <div className="mt-12 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
            {arcanaCounts.map(({ arcana: name, count }) => {
              const entry = ARCANA_GUIDE[name];
              return (
                <a
                  key={name}
                  href={`/arcana/${name.toLowerCase()}/`}
                  className="group flex flex-col border-b-2 border-r-2 border-ink bg-card p-6 transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                >
                  <span className="font-display text-2xl uppercase leading-none">
                    {name}
                  </span>
                  <span className="mt-2 font-mono text-[11px] uppercase tracking-wider text-blood group-hover:text-[#ff8a9b]">
                    {entry?.confidant ?? "-"}
                  </span>
                  <span className="mt-6 font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
                    {count} personas
                  </span>
                </a>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
