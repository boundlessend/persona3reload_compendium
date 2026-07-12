import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPersonas, PERSONA_COUNT, type Persona } from "./api";
import {
  AFFINITY_FILTER_LABELS,
  AFFINITY_KEYS,
  SORT_LABELS,
  SORTERS,
  type AffinityKey,
  type DlcFilter,
  type SortKey,
} from "./constants";
import { PersonaCard } from "./PersonaCard";
import { PersonaModal } from "./PersonaModal";
import { CompareModal } from "./CompareModal";
import { TeamModal } from "./TeamModal";
import { Dropdown } from "./Dropdown";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { PersonaOfTheDay } from "./PersonaOfTheDay";
import { NotFound } from "./NotFound";
import { useFavorites } from "./useFavorites";
import { usePersonaRouting } from "./usePersonaRouting";

export default function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [arcana, setArcana] = useState("All");
  const [sort, setSort] = useState<SortKey>("id");
  const [element, setElement] = useState("All");
  const [affinityType, setAffinityType] = useState<AffinityKey>("weak");
  const [element2, setElement2] = useState("All");
  const [affinityType2, setAffinityType2] = useState<AffinityKey>("resists");
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(99);
  const [dlcFilter, setDlcFilter] = useState<DlcFilter>("all");
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Persona[]>([]);
  const [teamMode, setTeamMode] = useState(false);
  const [teamList, setTeamList] = useState<Persona[]>([]);
  const [teamOpen, setTeamOpen] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const { favorites, toggleFavorite } = useFavorites();
  const { selected, notFound, openPersona, closePersona } =
    usePersonaRouting(personas);

  useEffect(() => {
    const controller = new AbortController();
    fetchPersonas(controller.signal)
      .then(setPersonas)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // восстановить сравнение/команду из query при заходе по расшаренной ссылке
  useEffect(() => {
    if (!personas.length) return;
    const params = new URLSearchParams(window.location.search);
    const resolve = (slugs: string) =>
      slugs
        .split(",")
        .map((slug) => personas.find((p) => p.query === slug))
        .filter((p): p is Persona => Boolean(p));
    const compareParam = params.get("compare");
    const teamParam = params.get("team");
    if (compareParam) {
      const picks = resolve(compareParam);
      if (picks.length >= 2) {
        setCompareMode(true);
        setCompareList(picks.slice(0, 2));
      }
    } else if (teamParam) {
      const picks = resolve(teamParam);
      if (picks.length >= 2) {
        setTeamMode(true);
        setTeamList(picks.slice(0, 4));
        setTeamOpen(true);
      }
    }
  }, [personas]);

  // последний share-URL, что МЫ записали: чтобы убирать query только за собой,
  // не затирая ?compare/?team из входящей ссылки до того, как её прочтёт restore
  const sharedUrlRef = useRef<string | null>(null);

  // отразить открытое сравнение/команду в URL (replaceState: без новых записей
  // истории). Персона-модалка владеет своим путём отдельно, поэтому пропускаем
  useEffect(() => {
    if (selected) return;
    const a = compareList[0];
    const b = compareList[1];
    let next: string | null = null;
    if (a && b) next = `/?compare=${a.query},${b.query}`;
    else if (teamOpen && teamList.length >= 2)
      next = `/?team=${teamList.map((p) => p.query).join(",")}`;
    if (next) {
      if (next !== sharedUrlRef.current) {
        window.history.replaceState(null, "", next);
        sharedUrlRef.current = next;
      }
    } else if (sharedUrlRef.current) {
      // сравнение/команду закрыли - убрать наши query, не трогая путь
      window.history.replaceState(null, "", window.location.pathname);
      sharedUrlRef.current = null;
    }
  }, [compareList, teamOpen, teamList, selected]);

  // Compare и Team - взаимоисключающие режимы выбора карт
  const toggleCompareMode = () => {
    setCompareMode((on) => !on);
    setCompareList([]);
    setTeamMode(false);
    setTeamList([]);
  };

  const toggleTeamMode = () => {
    setTeamMode((on) => !on);
    setTeamList([]);
    setTeamOpen(false);
    setCompareMode(false);
    setCompareList([]);
  };

  const toggleCompare = useCallback((persona: Persona) => {
    setCompareList((prev) => {
      if (prev.some((item) => item.id === persona.id))
        return prev.filter((item) => item.id !== persona.id);
      if (prev.length >= 2) {
        const kept = prev[prev.length - 1];
        return kept ? [kept, persona] : [persona];
      }
      return [...prev, persona];
    });
  }, []);

  const toggleTeam = useCallback((persona: Persona) => {
    setTeamList((prev) => {
      if (prev.some((item) => item.id === persona.id))
        return prev.filter((item) => item.id !== persona.id);
      // сверх 4 - выбрасываем самого старого, чтобы клик всегда что-то делал
      if (prev.length >= 4) return [...prev.slice(1), persona];
      return [...prev, persona];
    });
  }, []);

  const onCardClick = useCallback(
    (persona: Persona) => {
      if (compareMode) toggleCompare(persona);
      else if (teamMode) toggleTeam(persona);
      else openPersona(persona);
    },
    [compareMode, teamMode, toggleCompare, toggleTeam, openPersona],
  );

  // Shuffle Time: открыть случайную персону из всех
  const shuffle = useCallback(() => {
    if (!personas.length) return;
    const pick = personas[Math.floor(Math.random() * personas.length)];
    if (pick) openPersona(pick);
  }, [personas, openPersona]);

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
      if (element2 !== "All" && !persona[affinityType2].includes(element2))
        return false;
      if (persona.level < levelMin || persona.level > levelMax) return false;
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
    element2,
    affinityType2,
    levelMin,
    levelMax,
    sort,
  ]);

  const [compareA, compareB] = compareList;

  if (notFound) return <NotFound />;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main>
        <Hero personas={personas} arcanaCount={arcanas.length - 1} />

        {personas.length > 0 && (
          <div className="mx-auto max-w-6xl px-6 pt-16">
            <PersonaOfTheDay personas={personas} onSelect={openPersona} />
          </div>
        )}

        <section id="browse" className="mx-auto max-w-6xl px-6 py-16">
          <div className="flex flex-col gap-6 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-[clamp(2.25rem,11vw,3rem)] uppercase leading-none tracking-tight">
                The compendium
              </h2>
              <p className="mt-3 font-mono text-xs uppercase tracking-wider text-mut">
                {loading
                  ? "Loading…"
                  : `${visible.length} of ${personas.length || PERSONA_COUNT} personas`}
              </p>
            </div>
            <input
              type="search"
              aria-label="Search by name"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name…"
              className="w-full border-2 border-ink bg-transparent px-4 py-3 font-mono text-sm text-ink outline-none transition placeholder:text-mut focus:border-blood md:w-72"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mut">
              Sort
              <Dropdown
                value={sort}
                options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
                  value: key,
                  label: SORT_LABELS[key],
                }))}
                onChange={setSort}
                ariaLabel="Sort"
              />
            </label>

            <div className="flex items-center gap-2">
              <Dropdown
                value={affinityType}
                options={AFFINITY_KEYS.map((key) => ({
                  value: key,
                  label: AFFINITY_FILTER_LABELS[key],
                }))}
                onChange={setAffinityType}
                ariaLabel="Affinity type"
              />
              <Dropdown
                value={element}
                options={elements.map((name) => ({
                  value: name,
                  label: name === "All" ? "Any element" : name,
                }))}
                onChange={setElement}
                ariaLabel="Element"
              />
              <span className="font-mono text-[11px] text-mut" aria-hidden="true">
                +
              </span>
              <Dropdown
                value={affinityType2}
                options={AFFINITY_KEYS.map((key) => ({
                  value: key,
                  label: AFFINITY_FILTER_LABELS[key],
                }))}
                onChange={setAffinityType2}
                ariaLabel="Second affinity type"
              />
              <Dropdown
                value={element2}
                options={elements.map((name) => ({
                  value: name,
                  label: name === "All" ? "Any element" : name,
                }))}
                onChange={setElement2}
                ariaLabel="Second element"
              />
            </div>

            <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mut">
              Lv
              <input
                type="number"
                min={1}
                max={99}
                value={levelMin}
                onChange={(event) =>
                  setLevelMin(
                    Math.max(1, Math.min(99, Number(event.target.value) || 1)),
                  )
                }
                aria-label="Minimum level"
                className="w-14 border-2 border-ink bg-transparent px-2 py-2 text-center text-ink outline-none transition focus:border-blood"
              />
              <span aria-hidden="true">-</span>
              <input
                type="number"
                min={1}
                max={99}
                value={levelMax}
                onChange={(event) =>
                  setLevelMax(
                    Math.max(1, Math.min(99, Number(event.target.value) || 99)),
                  )
                }
                aria-label="Maximum level"
                className="w-14 border-2 border-ink bg-transparent px-2 py-2 text-center text-ink outline-none transition focus:border-blood"
              />
            </label>

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

            <button
              onClick={toggleTeamMode}
              aria-pressed={teamMode}
              className={`border-2 px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                teamMode
                  ? "border-blood bg-blood text-paper"
                  : "border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              {teamMode ? "Team…" : "Team"}
            </button>

            <button
              onClick={shuffle}
              className="border-2 border-ink px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
            >
              Shuffle
            </button>
          </div>

          {compareMode && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-blood">
              Pick two personas to compare ({compareList.length}/2).
            </p>
          )}

          {teamMode && (
            <p className="mt-3 font-mono text-xs uppercase tracking-wider text-blood">
              Pick up to four for coverage ({teamList.length}/4).
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
                marked={
                  compareList.some((item) => item.id === persona.id) ||
                  teamList.some((item) => item.id === persona.id)
                }
                isFavorite={favorites.has(persona.query)}
                selecting={compareMode || teamMode}
              />
            ))}
          </div>

          {!loading && !error && !visible.length && (
            <p className="mt-10 text-center font-mono text-sm uppercase tracking-wider text-mut">
              No personas match your filters.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t-2 border-ink px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 text-center font-mono text-xs uppercase tracking-wider text-mut">
          <span>© boundlessend</span>
          <span>Fan project · not affiliated with Atlus/Sega</span>
          <span>Persona © Atlus/Sega</span>
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

      {compareA && compareB && !selected && (
        <CompareModal
          a={compareA}
          b={compareB}
          onClose={() => setCompareList([])}
        />
      )}

      {teamMode && teamList.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
              Team {teamList.length}/4
            </span>
            <div className="flex min-w-0 flex-wrap gap-2">
              {teamList.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => toggleTeam(persona)}
                  aria-label={`Remove ${persona.name}`}
                  className="border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper"
                >
                  {persona.name} ✕
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setTeamList([])}
                className="border-2 border-ink px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
              >
                Clear
              </button>
              <button
                onClick={() => setTeamOpen(true)}
                disabled={teamList.length < 2}
                className="border-2 border-blood bg-blood px-3 py-2 font-mono text-xs uppercase tracking-wider text-paper transition hover:bg-ink hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {teamOpen && teamList.length >= 2 && !selected && (
        <TeamModal team={teamList} onClose={() => setTeamOpen(false)} />
      )}
    </div>
  );
}
