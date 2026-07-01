import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  fetchPersonas,
  PERSONA_COUNT,
  STAT_KEYS,
  type Persona,
  type StatKey,
} from "./api";

type AffinityKey = "weak" | "resists" | "reflects" | "absorbs" | "nullifies";

const AFFINITIES: { key: AffinityKey; label: string; tone: string }[] = [
  {
    key: "weak",
    label: "Weak",
    tone: "bg-blood text-paper",
  },
  {
    key: "resists",
    label: "Resists",
    tone: "bg-ink text-paper",
  },
  {
    key: "reflects",
    label: "Reflects",
    tone: "border border-ink text-ink",
  },
  {
    key: "absorbs",
    label: "Absorbs",
    tone: "bg-mut text-paper",
  },
  {
    key: "nullifies",
    label: "Nulls",
    tone: "border border-ink/40 text-mut",
  },
];

const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  magic: "Magic",
  endurance: "Endurance",
  agility: "Agility",
  luck: "Luck",
};

const AFFINITY_KEYS: readonly AffinityKey[] = AFFINITIES.map((item) => item.key);

const AFFINITY_FILTER_LABELS: Record<AffinityKey, string> = {
  weak: "Weak to",
  resists: "Resists",
  reflects: "Reflects",
  absorbs: "Absorbs",
  nullifies: "Nullifies",
};

type SortKey = "id" | "level" | "name" | "arcana";
const SORT_LABELS: Record<SortKey, string> = {
  id: "Default",
  level: "Level",
  name: "Name",
  arcana: "Arcana",
};
const SORTERS: Record<SortKey, (a: Persona, b: Persona) => number> = {
  id: (a, b) => a.id - b.id,
  level: (a, b) => a.level - b.level,
  name: (a, b) => a.name.localeCompare(b.name),
  arcana: (a, b) => a.arcana.localeCompare(b.arcana) || a.level - b.level,
};

type DlcFilter = "all" | "base" | "dlc";

const SELECT_CLASS =
  "border-2 border-ink bg-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-ink outline-none transition focus:border-blood";

const idTag = (id: number): string => `№${String(id).padStart(3, "0")}`;

// Inline placeholder for the handful of personas whose upstream art 404s.
function placeholderFor(name: string): string {
  const initial = name.slice(0, 1).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#eae4d6"/>
    <text x="50%" y="56%" font-family="sans-serif" font-size="96" font-weight="800"
      font-style="italic" fill="#c8102e" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function PersonaImage({
  persona,
  className,
  onClick,
}: {
  persona: Persona;
  className: string;
  onClick?: () => void;
}) {
  return (
    <img
      src={persona.image}
      alt={persona.name}
      loading="lazy"
      decoding="async"
      onClick={onClick}
      onError={(event) => {
        const img = event.currentTarget;
        img.onerror = null;
        img.src = placeholderFor(persona.name);
      }}
      className={className}
    />
  );
}

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

function Hero({ personas }: { personas: Persona[] }) {
  const count = personas.length || PERSONA_COUNT;
  return (
    <section id="top" className="border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-end gap-8 py-16 md:grid-cols-[1.3fr_0.7fr] md:py-20">
          <div>
            <p className="font-mono text-sm tracking-[0.1em] text-blood">
              FIG. 001 — {count} / THE FULL RECORD
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
              [22, "Arcana"],
              [5, "Affinities"],
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

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / 99) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-wider text-mut">
        <span>{label}</span>
        <span className="text-ink">{value}</span>
      </div>
      <div className="h-2 border border-ink">
        <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function PersonaCard({
  persona,
  onSelect,
  marked,
  isFavorite,
}: {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  marked: boolean;
  isFavorite: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(persona)}
      aria-pressed={marked}
      className={`group relative flex flex-col border-b-2 border-r-2 border-ink bg-card p-5 text-left transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
        marked ? "outline outline-[3px] -outline-offset-[3px] outline-blood" : ""
      }`}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-wider">
        <span className="text-blood group-hover:text-[#ff8a9b]">
          {idTag(persona.id)}
        </span>
        <span className="text-mut group-hover:text-paper2">
          LV {persona.level}
        </span>
      </div>
      <div className="relative my-3 grid h-36 place-items-center">
        <PersonaImage
          persona={persona}
          className="h-32 object-contain mix-blend-multiply transition group-hover:mix-blend-normal"
        />
        {persona.dlc === 1 && (
          <span className="absolute right-0 top-0 bg-blood px-2 py-0.5 font-mono text-[10px] tracking-wider text-paper">
            DLC
          </span>
        )}
        {isFavorite && (
          <span
            className="absolute bottom-0 right-0 text-lg leading-none text-blood group-hover:text-paper"
            aria-label="Favorite"
          >
            ★
          </span>
        )}
      </div>
      <p className="font-display text-xl uppercase leading-none text-ink group-hover:text-paper">
        {persona.name}
      </p>
      <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
        {persona.arcana}
      </p>
    </button>
  );
}

// shared dialog behaviour: scroll lock, initial focus, focus restore on close,
// Escape, and a Tab focus trap (disabled while trapActive is false)
function useDialog(
  ref: RefObject<HTMLDivElement | null>,
  onEscape: () => void,
  trapActive: boolean,
) {
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [ref]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
        return;
      }
      if (event.key !== "Tab" || !trapActive) return;
      const focusable = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref, onEscape, trapActive]);
}

function PersonaModal({
  persona,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  persona: Persona;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (query: string) => void;
}) {
  const [zoom, setZoom] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes the zoom first, then the modal; Tab trap pauses during zoom
  useDialog(panelRef, () => (zoom ? setZoom(false) : onClose()), !zoom);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={persona.name}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border-2 border-ink bg-paper p-8 outline-none sm:shadow-[8px_8px_0_0_#16130d]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b-2 border-ink pb-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setZoom(true)}
              className="group relative grid h-28 w-28 shrink-0 place-items-center border-2 border-ink bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
              aria-label="Enlarge artwork"
            >
              <PersonaImage
                persona={persona}
                className="h-24 object-contain mix-blend-multiply"
              />
              <span className="absolute bottom-1 right-1 bg-ink px-1.5 py-0.5 font-mono text-[10px] uppercase text-paper opacity-0 transition group-hover:opacity-100">
                Zoom
              </span>
            </button>
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-blood">
                {idTag(persona.id)} · {persona.arcana} · Lv {persona.level}
              </p>
              <h2 className="mt-1 font-display text-5xl uppercase leading-none">
                {persona.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(persona.query)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              className={`grid h-9 w-9 place-items-center border-2 text-lg leading-none transition ${
                isFavorite
                  ? "border-blood bg-blood text-paper"
                  : "border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-mut">{persona.description}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Stats
            </h3>
            <div className="mt-4 space-y-3">
              {STAT_KEYS.map((key) => (
                <StatBar
                  key={key}
                  label={STAT_LABELS[key]}
                  value={persona[key]}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Affinities
            </h3>
            <div className="mt-4 space-y-3">
              {AFFINITIES.map(({ key, label, tone }) => {
                const values = persona[key];
                if (!values.length) return null;
                return (
                  <div
                    key={label}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1"
                  >
                    <span className="w-20 shrink-0 font-mono text-[11px] uppercase tracking-wider text-mut">
                      {label}
                    </span>
                    {values.map((value) => (
                      <span
                        key={value}
                        className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${tone}`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                );
              })}
              {AFFINITIES.every(({ key }) => !persona[key].length) && (
                <p className="font-mono text-sm text-mut">
                  No notable affinities.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setZoom(false);
          }}
        >
          <PersonaImage
            persona={persona}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              setZoom(false);
            }}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center border-2 border-paper text-paper transition hover:bg-paper hover:text-ink"
            aria-label="Close artwork"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

function CompareModal({
  a,
  b,
  onClose,
}: {
  a: Persona;
  b: Persona;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onClose, true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compare personas"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-2 border-ink bg-paper p-5 outline-none sm:p-8 sm:shadow-[8px_8px_0_0_#16130d]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink pb-5">
          <h2 className="font-display text-3xl uppercase">Compare</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
          {[a, b].map((persona) => (
            <div key={persona.id} className="space-y-4">
              <div className="text-center">
                <PersonaImage
                  persona={persona}
                  className="mx-auto h-24 object-contain mix-blend-multiply"
                />
                <p className="mt-2 font-display text-xl uppercase leading-none sm:text-2xl">
                  {persona.name}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-blood">
                  {persona.arcana} · Lv {persona.level}
                </p>
              </div>
              <div className="space-y-2">
                {STAT_KEYS.map((key) => (
                  <StatBar
                    key={key}
                    label={STAT_LABELS[key]}
                    value={persona[key]}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {AFFINITIES.map(({ key, label, tone }) => {
                  const values = persona[key];
                  if (!values.length) return null;
                  return (
                    <div
                      key={label}
                      className="flex flex-wrap items-center gap-1"
                    >
                      <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-mut">
                        {label}
                      </span>
                      {values.map((value) => (
                        <span
                          key={value}
                          className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${tone}`}
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
    fetchPersonas()
      .then(setPersonas)
      .catch((err) => setError(err.message));
  }, []);

  // open the persona named in the URL (/persona/<query>) once data is loaded
  useEffect(() => {
    if (!personas.length) return;
    const match = window.location.pathname.match(/^\/persona\/(.+)$/);
    if (!match) return;
    const persona = personas.find(
      (item) => item.query === decodeURIComponent(match[1]),
    );
    if (persona) setSelected(persona);
  }, [personas]);

  useEffect(() => {
    const onPop = () => {
      const match = window.location.pathname.match(/^\/persona\/(.+)$/);
      const persona = match
        ? personas.find((item) => item.query === decodeURIComponent(match[1]))
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

  const openPersona = (persona: Persona) => {
    setSelected(persona);
    window.history.pushState(null, "", `/persona/${persona.query}`);
  };

  const closePersona = () => {
    setSelected(null);
    if (window.location.pathname !== "/")
      window.history.pushState(null, "", "/");
  };

  const toggleCompareMode = () => {
    setCompareMode((on) => !on);
    setCompareList([]);
  };

  const toggleCompare = (persona: Persona) => {
    setCompareList((prev) => {
      if (prev.some((item) => item.id === persona.id))
        return prev.filter((item) => item.id !== persona.id);
      if (prev.length >= 2) return [prev[1], persona];
      return [...prev, persona];
    });
  };

  const onCardClick = (persona: Persona) => {
    if (compareMode) toggleCompare(persona);
    else openPersona(persona);
  };

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
    return [...filtered].sort(SORTERS[sort]);
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
        <Hero personas={personas} />

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

            <div className="flex border-2 border-ink" role="group" aria-label="Filter by DLC">
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
