import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPersonas, PERSONA_COUNT, type Persona } from "./api";
import {
  AFFINITIES,
  AFFINITY_FILTER_LABELS,
  AFFINITY_KEYS,
  decodeQuery,
  SELECT_CLASS,
  SORT_LABELS,
  SORTERS,
  type AffinityKey,
  type DlcFilter,
  type SortKey,
} from "./constants";
import { PersonaCard } from "./PersonaCard";
import { PersonaModal } from "./PersonaModal";
import { CompareModal } from "./CompareModal";

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-baseline gap-3">
          <span className="font-display text-2xl uppercase tracking-tight">
            Compendium
          </span>
          <span className="border border-blood px-1.5 py-0.5 font-mono text-[11px] tracking-widest text-blood">
            P3R
          </span>
        </a>
        <div className="flex items-center gap-5 md:gap-7">
          <a
            href="#browse"
            className="font-mono text-xs uppercase tracking-wider text-ink transition hover:text-blood"
          >
            Browse
          </a>
          <a
            href="https://github.com/boundlessend/persona3reload_compendium"
            className="bg-ink px-5 py-2 font-mono text-xs uppercase tracking-wider text-paper transition hover:bg-blood"
          >
            Source ↗
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero({
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
            <h1 className="mt-5 font-display text-6xl uppercase leading-[0.84] tracking-tight md:text-8xl">
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
              [arcanaCount || 22, "Arcana"],
              [AFFINITIES.length, "Affinities"],
            ] as [number, string][]
          ).map(([value, label], index) => (
            <div
              key={label}
              className={`flex-1 py-5 ${index < 2 ? "border-r-2 border-ink" : ""}`}
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

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [arcana, setArcana] = useState("All");
  const [sort, setSort] = useState<SortKey>("id");
  const [element, setElement] = useState("All");
  const [affinityType, setAffinityType] = useState<AffinityKey>("weak");
  const [dlcFilter, setDlcFilter] = useState<DlcFilter>("all");
  const [selected, setSelected] = useState<Persona | null>(null);
  // did WE push a /persona/... entry? drives whether close pops or replaces
  const historyPushedRef = useRef(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Persona[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("favorites");
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify([...favorites]));
    } catch {
      // storage unavailable (private mode / quota): degrade to in-memory only
    }
  }, [favorites]);

  const toggleFavorite = (query: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(query)) next.delete(query);
      else next.add(query);
      return next;
    });
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchPersonas(controller.signal)
      .then(setPersonas)
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(err.message);
      });
    return () => controller.abort();
  }, []);

  // open the persona named in the URL (/persona/<query>) once data is loaded
  useEffect(() => {
    if (!personas.length) return;
    const match = window.location.pathname.match(/^\/persona\/(.+)$/);
    if (!match) return;
    const query = decodeQuery(match[1]);
    if (query === null) return;
    const persona = personas.find((item) => item.query === query);
    if (persona) setSelected(persona);
  }, [personas]);

  useEffect(() => {
    const onPop = () => {
      historyPushedRef.current = false;
      const match = window.location.pathname.match(/^\/persona\/(.+)$/);
      const query = match ? decodeQuery(match[1]) : null;
      const persona = query
        ? personas.find((item) => item.query === query)
        : undefined;
      setSelected(persona ?? null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [personas]);

  useEffect(() => {
    document.title = selected
      ? `${selected.name} · Persona Compendium`
      : "Persona Compendium · Persona 3 Reload";
  }, [selected]);

  const openPersona = useCallback((persona: Persona) => {
    setSelected(persona);
    window.history.pushState(null, "", `/persona/${persona.query}`);
    historyPushedRef.current = true;
  }, []);

  const closePersona = () => {
    setSelected(null);
    // pop our own entry so Back does not re-open the modal; on a direct deep
    // link (no entry of ours) replace it instead, to avoid leaving the site
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    } else if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  };

  const toggleCompareMode = () => {
    setCompareMode((on) => !on);
    setCompareList([]);
  };

  const toggleCompare = useCallback((persona: Persona) => {
    setCompareList((prev) => {
      if (prev.some((item) => item.id === persona.id))
        return prev.filter((item) => item.id !== persona.id);
      if (prev.length >= 2) return [prev[1], persona];
      return [...prev, persona];
    });
  }, []);

  const onCardClick = useCallback(
    (persona: Persona) => {
      if (compareMode) toggleCompare(persona);
      else openPersona(persona);
    },
    [compareMode, toggleCompare, openPersona],
  );

  const arcanas = useMemo(
    () => ["All", ...Array.from(new Set(personas.map((p) => p.arcana))).sort()],
    [personas],
  );

  const elements = useMemo(() => {
    const set = new Set<string>();
    for (const persona of personas)
      for (const key of AFFINITY_KEYS)
        for (const value of persona[key]) set.add(value);
    return ["All", ...Array.from(set).sort()];
  }, [personas]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = personas.filter((persona) => {
      if (arcana !== "All" && persona.arcana !== arcana) return false;
      if (term && !persona.name.toLowerCase().includes(term)) return false;
      if (dlcFilter === "base" && persona.dlc !== 0) return false;
      if (dlcFilter === "dlc" && persona.dlc !== 1) return false;
      if (favoritesOnly && !favorites.has(persona.query)) return false;
      if (element !== "All" && !persona[affinityType].includes(element))
        return false;
      return true;
    });
    return filtered.sort(SORTERS[sort]);
  }, [
    personas,
    search,
    arcana,
    dlcFilter,
    favoritesOnly,
    favorites,
    element,
    affinityType,
    sort,
  ]);

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero personas={personas} arcanaCount={arcanas.length - 1} />

        <section id="browse" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-6 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-5xl uppercase leading-none tracking-tight">
                The compendium
              </h2>
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-mut">
                {visible.length} of {personas.length || PERSONA_COUNT} personas
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name…"
              className="w-full border-2 border-ink bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none transition placeholder:text-mut focus:border-blood md:w-72"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mut">
              Sort
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                className={SELECT_CLASS}
              >
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <option key={key} value={key}>
                    {SORT_LABELS[key]}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-2">
              <select
                value={affinityType}
                onChange={(event) =>
                  setAffinityType(event.target.value as AffinityKey)
                }
                className={SELECT_CLASS}
                aria-label="Affinity type"
              >
                {AFFINITY_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {AFFINITY_FILTER_LABELS[key]}
                  </option>
                ))}
              </select>
              <select
                value={element}
                onChange={(event) => setElement(event.target.value)}
                className={SELECT_CLASS}
                aria-label="Element"
              >
                {elements.map((name) => (
                  <option key={name} value={name}>
                    {name === "All" ? "Any element" : name}
                  </option>
                ))}
              </select>
            </div>

            <div
              className="flex border-2 border-ink"
              role="group"
              aria-label="Filter by DLC"
            >
              {(
                [
                  ["all", "All"],
                  ["base", "Base"],
                  ["dlc", "DLC"],
                ] as [DlcFilter, string][]
              ).map(([value, label], index) => (
                <button
                  key={value}
                  onClick={() => setDlcFilter(value)}
                  aria-pressed={dlcFilter === value}
                  className={`px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                    index < 2 ? "border-r-2 border-ink" : ""
                  } ${
                    dlcFilter === value
                      ? "bg-ink text-paper"
                      : "text-ink hover:bg-ink/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setFavoritesOnly((on) => !on)}
              aria-pressed={favoritesOnly}
              className={`ml-auto border-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                favoritesOnly
                  ? "border-blood bg-blood text-paper"
                  : "border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              ★ Favorites
            </button>

            <button
              onClick={toggleCompareMode}
              aria-pressed={compareMode}
              className={`border-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                compareMode
                  ? "border-blood bg-blood text-paper"
                  : "border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              {compareMode ? "Comparing…" : "Compare"}
            </button>
          </div>

          {compareMode && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-blood">
              Pick two personas to compare ({compareList.length}/2).
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {arcanas.map((name) => (
              <button
                key={name}
                onClick={() => setArcana(name)}
                aria-pressed={arcana === name}
                className={`border-2 border-ink px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                  arcana === name
                    ? "bg-ink text-paper"
                    : "text-ink hover:bg-ink hover:text-paper"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-10 border-2 border-blood bg-blood/10 p-5 font-mono text-sm text-blood">
              Could not load personas: {error}. Try refreshing the page.
            </p>
          )}

          <div className="mt-10 grid grid-cols-2 border-l-2 border-t-2 border-ink sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={onCardClick}
                marked={compareList.some((item) => item.id === persona.id)}
                isFavorite={favorites.has(persona.query)}
                compareMode={compareMode}
              />
            ))}
          </div>

          {!error && !visible.length && (
            <p className="mt-10 text-center font-mono text-sm uppercase tracking-wider text-mut">
              No personas match your filters.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t-2 border-ink px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between font-mono text-xs uppercase tracking-wider text-mut">
          <span>© boundlessend</span>
          <span>Persona 3 Reload · Compendium</span>
        </div>
      </footer>

      {selected && (
        <PersonaModal
          persona={selected}
          onClose={closePersona}
          isFavorite={favorites.has(selected.query)}
          onToggleFavorite={toggleFavorite}
        />
      )}

      {compareList.length === 2 && !selected && (
        <CompareModal
          a={compareList[0]}
          b={compareList[1]}
          onClose={() => setCompareList([])}
        />
      )}
    </div>
  );
}
