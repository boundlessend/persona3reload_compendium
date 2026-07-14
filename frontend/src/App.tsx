import { useCallback, useEffect, useMemo, useState } from "react";
import { PERSONA_COUNT, type Persona } from "./api";
import { usePersonas } from "./usePersonas";
import { useSkills } from "./useSkills";
import {
  AFFINITY_FILTER_LABELS,
  AFFINITY_KEYS,
  SORT_LABELS,
  type DlcFilter,
  type SortKey,
} from "./constants";
import { isSpecialFusion, reverseIndex } from "./fusion";
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
import { useCatalogFilters } from "./useCatalogFilters";
import { useShareableFilters } from "./useShareableFilters";
import { usePersonaRouting } from "./usePersonaRouting";
import { useServiceWorker } from "./useServiceWorker";
import { CommandPalette } from "./CommandPalette";

function HomePage() {
  const { personas, loading, error } = usePersonas();
  // обратный индекс рецептов считаем один раз на уровне владельца personas, а не
  // внутри модалки (та размонтируется при закрытии и теряет memo) - см. reverseIdx
  const reverseIdx = useMemo(() => reverseIndex(personas), [personas]);
  const { skills } = useSkills();
  const { favorites, toggleFavorite } = useFavorites();
  const { registered, toggleRegistered } = useRegistered();
  const { selected, notFound, openPersona, closePersona } =
    usePersonaRouting(personas);

  // вся стейт-машина фильтров каталога и производные - в отдельном хуке;
  // деструктурируем обратно в локали, чтобы JSX ниже читался как раньше
  const cf = useCatalogFilters(personas, favorites, registered);
  const {
    search,
    setSearch,
    arcana,
    setArcana,
    origin,
    setOrigin,
    sort,
    setSort,
    element,
    setElement,
    affinityType,
    setAffinityType,
    element2,
    setElement2,
    affinityType2,
    setAffinityType2,
    levelMin,
    setLevelMin,
    levelMax,
    setLevelMax,
    dlcFilter,
    setDlcFilter,
    favoritesOnly,
    setFavoritesOnly,
    noWeakness,
    setNoWeakness,
    missingOnly,
    setMissingOnly,
    advancedOpen,
    setAdvancedOpen,
    shown,
    loadMore,
    arcanas,
    origins,
    elements,
    visible,
    advancedActive,
    activeFilters,
    clearAllFilters,
  } = cf;

  // Compare/Team - оркестрация модалок, состояние остаётся в HomePage
  const [compareMode, setCompareMode] = useState(false);
  const [compareList, setCompareList] = useState<Persona[]>([]);
  const [teamMode, setTeamMode] = useState(false);
  const [teamList, setTeamList] = useState<Persona[]>([]);
  const [teamOpen, setTeamOpen] = useState(false);

  // единый владелец URL: восстановление из расшаренной ссылки + отражение в query
  useShareableFilters({
    personas,
    selected,
    filters: cf,
    compareList,
    setCompareMode,
    setCompareList,
    teamList,
    teamOpen,
    setTeamMode,
    setTeamList,
    setTeamOpen,
  });

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

  const [compareA, compareB] = compareList;

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

          {activeFilters.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
                Filters
              </span>
              {activeFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={filter.clear}
                  aria-label={`Remove filter: ${filter.label}`}
                  className="group flex items-center gap-1.5 border-2 border-ink bg-card px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-ink transition hover:border-blood hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                >
                  {filter.label}
                  <span
                    aria-hidden="true"
                    className="text-mut transition group-hover:text-blood"
                  >
                    ✕
                  </span>
                </button>
              ))}
              {activeFilters.length > 1 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="font-mono text-[11px] uppercase tracking-wider text-blood underline underline-offset-2 transition hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

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
              <ControlButton onClick={loadMore}>
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
          reverseIdx={reverseIdx}
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
function routePage() {
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

export default function App() {
  const { updateReady, applyUpdate } = useServiceWorker();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Cmd/Ctrl-K открывает/закрывает палитру; кнопка-хинт в навбаре шлёт open-событие
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    const onOpen = () => setPaletteOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  return (
    <>
      {routePage()}
      {paletteOpen && <CommandPalette onClose={() => setPaletteOpen(false)} />}
      {updateReady && (
        <div
          role="status"
          className="fixed inset-x-0 bottom-4 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-4 border-2 border-ink bg-card px-4 py-3 shadow-[6px_6px_0_0_#16130d]"
        >
          <span className="font-mono text-xs uppercase tracking-wider text-ink">
            New version available
          </span>
          <button
            type="button"
            onClick={applyUpdate}
            className="border-2 border-blood bg-blood px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-paper transition hover:border-ink hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
          >
            Reload
          </button>
        </div>
      )}
    </>
  );
}
