import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PERSONA_COUNT, type Persona } from "./api";
import { usePersonas } from "./usePersonas";
import { useSkills } from "./useSkills";
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
import { ControlButton, Chip } from "./Controls";
import { Dropdown } from "./Dropdown";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { PersonaOfTheDay } from "./PersonaOfTheDay";
import { StatsSection } from "./StatsSection";
import { Footer } from "./Footer";
import { ErrorNote } from "./ErrorNote";
import { NotFound } from "./NotFound";
import { ArcanaIndex } from "./ArcanaIndex";
import { ArcanaDetail } from "./ArcanaDetail";
import { SkillsBrowser } from "./SkillsBrowser";
import { BossBrowser } from "./BossBrowser";
import { RequestsBrowser } from "./RequestsBrowser";
import { useFavorites } from "./useFavorites";
import { useRegistered } from "./useRegistered";
import { isSpecialFusion } from "./fusion";
import { usePersonaRouting } from "./usePersonaRouting";

// сколько карточек показывать за раз; "Load more" догружает ещё столько же
const PAGE_SIZE = 48;

function HomePage() {
  const { personas, loading, error } = usePersonas();
  const { skills } = useSkills();
  const [search, setSearch] = useState("");
  const [arcana, setArcana] = useState("All");
  const [origin, setOrigin] = useState("All");
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
  const [noWeakness, setNoWeakness] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

  const { favorites, toggleFavorite } = useFavorites();
  const { registered, toggleRegistered } = useRegistered();
  const { selected, notFound, openPersona, closePersona } =
    usePersonaRouting(personas);

  // восстановить сравнение/команду из query при заходе по расшаренной ссылке
  useEffect(() => {
    if (!personas.length) return;
    // восстанавливаем сравнение/команду только на главной; страница персоны
    // (/persona/<q>/) владеет своим состоянием отдельно
    if (window.location.pathname !== "/") return;
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

  const origins = useMemo(
    () => ["All", ...Array.from(new Set(personas.map((p) => p.origin))).sort()],
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
    // диапазон уровней устойчив к перевёрнутому вводу (min > max)
    const lo = Math.min(levelMin, levelMax);
    const hi = Math.max(levelMin, levelMax);
    const filtered = personas.filter((persona) => {
      if (arcana !== "All" && persona.arcana !== arcana) return false;
      if (origin !== "All" && persona.origin !== origin) return false;
      if (term && !persona.name.toLowerCase().includes(term)) return false;
      if (dlcFilter === "base" && persona.dlc !== 0) return false;
      if (dlcFilter === "dlc" && persona.dlc !== 1) return false;
      if (dlcFilter === "special" && !isSpecialFusion(persona.query))
        return false;
      if (favoritesOnly && !favorites.has(persona.query)) return false;
      if (noWeakness && persona.weak.length > 0) return false;
      if (missingOnly && registered.has(persona.query)) return false;
      if (element !== "All" && !persona[affinityType].includes(element))
        return false;
      if (element2 !== "All" && !persona[affinityType2].includes(element2))
        return false;
      if (persona.level < lo || persona.level > hi) return false;
      return true;
    });
    return filtered.sort(SORTERS[sort]);
  }, [
    personas,
    search,
    arcana,
    origin,
    dlcFilter,
    favoritesOnly,
    noWeakness,
    missingOnly,
    favorites,
    registered,
    element,
    affinityType,
    element2,
    affinityType2,
    levelMin,
    levelMax,
    sort,
  ]);

  // при смене фильтра/поиска/сортировки снова показываем первую страницу
  // (не завязано на favorites, чтобы лайк не схлопывал уже подгруженный список)
  useEffect(() => {
    setShown(PAGE_SIZE);
  }, [
    search,
    arcana,
    origin,
    sort,
    element,
    affinityType,
    element2,
    affinityType2,
    levelMin,
    levelMax,
    dlcFilter,
    favoritesOnly,
    noWeakness,
    missingOnly,
  ]);

  const [compareA, compareB] = compareList;

  // активны ли фильтры внутри Advanced - чтобы пометить кнопку, когда панель свёрнута
  const advancedActive =
    origin !== "All" ||
    element !== "All" ||
    element2 !== "All" ||
    levelMin !== 1 ||
    levelMax !== 99 ||
    dlcFilter !== "all";

  if (notFound) return <NotFound />;

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className={teamMode && teamList.length > 0 ? "pb-28" : undefined}>
        <Hero
          personas={personas}
          arcanaCount={arcanas.length - 1}
          registered={registered}
        />

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
              <p
                aria-live="polite"
                className="mt-3 font-mono text-xs uppercase tracking-wider text-mut"
              >
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
            <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mut">
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
            </span>

            <ControlButton
              pressed={advancedOpen}
              onClick={() => setAdvancedOpen((prev) => !prev)}
            >
              Advanced{advancedActive && <span className="text-blood"> •</span>}{" "}
              {advancedOpen ? "▴" : "▾"}
            </ControlButton>

            <ControlButton
              pressed={noWeakness}
              onClick={() => setNoWeakness((on) => !on)}
              className="ml-auto"
            >
              No weakness
            </ControlButton>

            <ControlButton
              pressed={favoritesOnly}
              onClick={() => setFavoritesOnly((on) => !on)}
            >
              ★ Favorites
            </ControlButton>

            <ControlButton
              pressed={missingOnly}
              onClick={() => setMissingOnly((on) => !on)}
            >
              Missing
            </ControlButton>

            <ControlButton pressed={compareMode} onClick={toggleCompareMode}>
              {compareMode ? "Comparing…" : "Compare"}
            </ControlButton>

            <ControlButton pressed={teamMode} onClick={toggleTeamMode}>
              {teamMode ? "Team…" : "Team"}
            </ControlButton>

            <ControlButton onClick={shuffle}>Shuffle</ControlButton>
          </div>

          {advancedOpen && (
            <div className="mt-4 border-2 border-ink bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
                    Affinity
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
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
                    <span
                      className="font-mono text-[11px] uppercase tracking-wider text-mut"
                      aria-hidden="true"
                    >
                      and
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
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
                    Level
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={levelMin}
                      onChange={(event) =>
                        setLevelMin(
                          Math.max(
                            1,
                            Math.min(99, Number(event.target.value) || 1),
                          ),
                        )
                      }
                      aria-label="Minimum level"
                      className="w-14 border-2 border-ink bg-transparent px-2 py-2 text-center font-mono text-ink outline-none transition focus:border-blood"
                    />
                    <span aria-hidden="true">-</span>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={levelMax}
                      onChange={(event) =>
                        setLevelMax(
                          Math.max(
                            1,
                            Math.min(99, Number(event.target.value) || 99),
                          ),
                        )
                      }
                      aria-label="Maximum level"
                      className="w-14 border-2 border-ink bg-transparent px-2 py-2 text-center font-mono text-ink outline-none transition focus:border-blood"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
                    Origin
                  </span>
                  <Dropdown
                    value={origin}
                    options={origins.map((name) => ({
                      value: name,
                      label: name === "All" ? "Any origin" : name,
                    }))}
                    onChange={setOrigin}
                    ariaLabel="Origin"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
                    Source
                  </span>
                  <div
                    className="flex border-2 border-ink"
                    role="group"
                    aria-label="Filter by source"
                  >
                    {(
                      [
                        ["all", "All"],
                        ["base", "Base"],
                        ["dlc", "DLC"],
                        ["special", "Special"],
                      ] as [DlcFilter, string][]
                    ).map(([value, label], index) => (
                      <button
                        key={value}
                        onClick={() => setDlcFilter(value)}
                        aria-pressed={dlcFilter === value}
                        className={`px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                          index < 3 ? "border-r-2 border-ink" : ""
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
                </div>
              </div>
            </div>
          )}

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
              <Chip
                key={name}
                pressed={arcana === name}
                onClick={() => setArcana(name)}
                className="px-4 text-xs"
              >
                {name}
              </Chip>
            ))}
          </div>

          {error && <ErrorNote message={`Could not load personas: ${error}.`} />}

          <div className="mt-10 grid grid-cols-2 border-l-2 border-t-2 border-ink sm:grid-cols-3 lg:grid-cols-4">
            {visible.slice(0, shown).map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={onCardClick}
                marked={
                  compareList.some((item) => item.id === persona.id) ||
                  teamList.some((item) => item.id === persona.id)
                }
                isFavorite={favorites.has(persona.query)}
                registered={registered.has(persona.query)}
                onToggleRegistered={toggleRegistered}
                special={isSpecialFusion(persona.query)}
                selecting={compareMode || teamMode}
              />
            ))}
          </div>

          {visible.length > shown && (
            <div className="mt-10 flex justify-center">
              <ControlButton onClick={() => setShown((n) => n + PAGE_SIZE)}>
                Load more ({visible.length - shown} left)
              </ControlButton>
            </div>
          )}

          {!loading && !error && !visible.length && (
            <p className="mt-10 text-center font-mono text-sm uppercase tracking-wider text-mut">
              No personas match your filters.
            </p>
          )}
        </section>

        <StatsSection personas={personas} onSelect={openPersona} />
      </main>

      <Footer />

      {selected && (
        <PersonaModal
          persona={selected}
          personas={personas}
          skills={skills[selected.query] ?? null}
          onClose={closePersona}
          isFavorite={favorites.has(selected.query)}
          onToggleFavorite={toggleFavorite}
          isRegistered={registered.has(selected.query)}
          onToggleRegistered={toggleRegistered}
          registered={registered}
        />
      )}

      {compareA && compareB && !selected && (
        <CompareModal
          a={compareA}
          b={compareB}
          personas={personas}
          onSelect={openPersona}
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
                  className="border border-ink px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                >
                  {persona.name} ✕
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ControlButton onClick={() => setTeamList([])}>Clear</ControlButton>
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
        <TeamModal
          team={teamList}
          skills={skills}
          onClose={() => setTeamOpen(false)}
        />
      )}
    </div>
  );
}

// тонкий роутер верхнего уровня: /arcana/* - отдельные страницы, всё остальное
// (включая /persona/<q>/) обслуживает HomePage. Межстраничные переходы идут
// обычной навигацией по ссылкам, поэтому pathname читается один раз при загрузке
export default function App() {
  const path = window.location.pathname;
  const detail = path.match(/^\/arcana\/([^/]+)\/?$/);
  if (detail) {
    return <ArcanaDetail slug={decodeURIComponent(detail[1] ?? "").toLowerCase()} />;
  }
  if (/^\/arcana\/?$/.test(path)) return <ArcanaIndex />;
  if (/^\/skills\/guide\/?$/.test(path)) return <SkillsBrowser initialGuideOpen={true} />;
  if (/^\/skills\/?$/.test(path)) return <SkillsBrowser initialGuideOpen={false} />;
  if (/^\/bosses\/?$/.test(path)) return <BossBrowser />;
  if (/^\/requests\/?$/.test(path)) return <RequestsBrowser />;
  return <HomePage />;
}
