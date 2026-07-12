import { useMemo } from "react";
import { usePersonas } from "./usePersonas";
import { ARCANA_GUIDE } from "./arcanaGuide";
import { idTag } from "./constants";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { NotFound } from "./NotFound";

// страница /arcana/<slug>/: тема арканы, её Social Link и список персон
export function ArcanaDetail({ slug }: { slug: string }) {
  const { personas, loading } = usePersonas();

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
        <p className="mt-8 font-mono text-sm tracking-[0.1em] text-blood">
          ARCANA
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
          {arcanaName}
        </h1>
        {entry && (
          <>
            <p className="mt-4 font-mono text-xs uppercase tracking-wider text-blood">
              Social Link · {entry.confidant}
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-mut">
              {entry.blurb}
            </p>
          </>
        )}

        <h2 className="mt-12 border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
          {members.length} personas
        </h2>
        <div className="mt-6 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {members.map((persona) => (
            <a
              key={persona.id}
              href={`/persona/${encodeURIComponent(persona.query)}/`}
              className="group flex items-center justify-between gap-3 border-b-2 border-r-2 border-ink bg-card p-4 transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
            >
              <span className="min-w-0">
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
            </a>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
