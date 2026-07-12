import { useMemo, useState } from "react";
import type { Persona } from "./api";
import { usePersonas } from "./usePersonas";
import { useSkills } from "./useSkills";
import { useFavorites } from "./useFavorites";
import { ARCANA_GUIDE } from "./arcanaGuide";
import { idTag } from "./constants";
import { PersonaImage } from "./PersonaImage";
import { PersonaModal } from "./PersonaModal";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { NotFound } from "./NotFound";

// страница /arcana/<slug>/: тема арканы, её Social Link и список персон.
// клик по персоне открывает ту же модалку, что и на главной, прямо здесь
export function ArcanaDetail({ slug }: { slug: string }) {
  const { personas, loading } = usePersonas();
  const { skills } = useSkills();
  const { favorites, toggleFavorite } = useFavorites();
  const [selected, setSelected] = useState<Persona | null>(null);

  const arcanaName = useMemo(() => {
    for (const persona of personas)
      if (persona.arcana.toLowerCase() === slug) return persona.arcana;
    return null;
  }, [personas, slug]);

  const members = useMemo(
    () =>
      arcanaName
        ? personas
            .filter((persona) => persona.arcana === arcanaName)
            .sort((a, b) => a.level - b.level)
        : [],
    [personas, arcanaName],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-wider text-mut">
            Loading…
          </p>
        </main>
      </div>
    );
  }

  if (!arcanaName) return <NotFound />;

  const entry = ARCANA_GUIDE[arcanaName];

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <a
          href="/arcana/"
          className="font-mono text-xs uppercase tracking-wider text-mut transition hover:text-blood"
        >
          ← All arcana
        </a>
        <div className="mt-8 flex items-start gap-6">
          <img
            src={`/arcana-cards/${slug}.webp`}
            alt={`${arcanaName} arcana card`}
            className="hidden h-40 w-auto shrink-0 object-contain mix-blend-multiply sm:block"
          />
          <div className="min-w-0">
            <p className="font-mono text-sm tracking-[0.1em] text-blood">ARCANA</p>
            <h1 className="mt-3 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
              {arcanaName}
            </h1>
            {entry && (
              <p className="mt-4 font-mono text-xs uppercase tracking-wider text-blood">
                Social Link · {entry.confidant}
              </p>
            )}
          </div>
        </div>
        {entry && (
          <p className="mt-6 max-w-2xl leading-relaxed text-mut">{entry.blurb}</p>
        )}

        <h2 className="mt-12 border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
          {members.length} personas
        </h2>
        <div className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {members.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setSelected(persona)}
              className="group flex items-center gap-3 border-b-2 border-r-2 border-ink bg-card p-4 text-left transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
            >
              <PersonaImage
                persona={persona}
                className="h-12 w-12 shrink-0 object-contain mix-blend-multiply group-hover:mix-blend-normal"
              />
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg uppercase leading-none break-words">
                  {persona.name}
                </span>
                <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-mut group-hover:text-paper2">
                  {idTag(persona.id)}
                </span>
              </span>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-blood group-hover:text-[#ff8a9b]">
                Lv {persona.level}
              </span>
            </button>
          ))}
        </div>
      </main>
      <Footer />

      {selected && (
        <PersonaModal
          persona={selected}
          personas={personas}
          skills={skills[selected.query] ?? null}
          onClose={() => setSelected(null)}
          isFavorite={favorites.has(selected.query)}
          onToggleFavorite={toggleFavorite}
        />
      )}
    </div>
  );
}
