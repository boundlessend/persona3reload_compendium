import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchPersonas,
  PERSONA_COUNT,
  STAT_KEYS,
  type Persona,
  type StatKey,
} from "./api";

const AFFINITIES: { key: keyof Persona; label: string; tone: string }[] = [
  {
    key: "weak",
    label: "Weak",
    tone: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
  },
  {
    key: "resists",
    label: "Resists",
    tone: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-400/30",
  },
  {
    key: "reflects",
    label: "Reflects",
    tone: "bg-sees-500/15 text-sees-400 ring-1 ring-sees-500/40",
  },
  {
    key: "absorbs",
    label: "Absorbs",
    tone: "bg-moon/15 text-moon ring-1 ring-moon/30",
  },
  {
    key: "nullifies",
    label: "Nulls",
    tone: "bg-haze/15 text-haze ring-1 ring-haze/30",
  },
];

const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  magic: "Magic",
  endurance: "Endurance",
  agility: "Agility",
  luck: "Luck",
};

const AFFINITY_KEYS = [
  "weak",
  "resists",
  "reflects",
  "absorbs",
  "nullifies",
] as const;
type AffinityKey = (typeof AFFINITY_KEYS)[number];

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
  "border border-edge bg-panel px-3 py-2 text-sm font-semibold uppercase tracking-wider text-frost outline-none transition focus:border-sees-500";

// Inline placeholder for the handful of personas whose upstream art 404s.
function placeholderFor(name: string): string {
  const initial = name.slice(0, 1).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#0e1530"/>
    <text x="50%" y="54%" font-family="sans-serif" font-size="96" font-weight="800"
      font-style="italic" fill="#1f8fff" text-anchor="middle" dominant-baseline="middle">${initial}</text>
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
    <header className="sticky top-0 z-30 border-b border-edge/60 bg-abyss/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-3">
          <span className="shard grid h-9 w-9 place-items-center bg-sees-500 font-display text-lg font-extrabold italic text-abyss">
            P3
          </span>
          <span className="font-display text-2xl font-extrabold uppercase italic tracking-wide">
            Compendium
          </span>
        </a>
        <div className="hidden items-center gap-8 text-sm font-semibold uppercase tracking-wider text-haze md:flex">
          <a href="#browse" className="transition hover:text-frost">
            Browse
          </a>
          <a
            href="https://github.com/boundlessend/persona3reload_compendium"
            className="shard bg-sees-500 px-5 py-2 text-abyss transition hover:bg-sees-400"
          >
            Source
          </a>
        </div>
      </nav>
    </header>
  );
}

function Hero({ personas }: { personas: Persona[] }) {
  const count = personas.length || PERSONA_COUNT;
  const showcase = personas.slice(0, 4);
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_-10%,rgba(31,143,255,0.28),transparent_55%)]" />
      <div className="pointer-events-none absolute -left-1/4 top-1/4 h-[140%] w-1/2 -rotate-12 bg-[linear-gradient(90deg,transparent,rgba(31,143,255,0.06),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <div>
          <span className="inline-flex items-center gap-2 border-l-2 border-moon pl-3 text-sm font-semibold uppercase tracking-[0.3em] text-moon">
            Persona 3 Reload
          </span>
          <h1 className="mt-6 font-display text-7xl font-extrabold uppercase italic leading-[0.9] tracking-tight md:text-8xl">
            Summon
            <br />
            <span className="bg-gradient-to-r from-sees-400 via-sees-500 to-sees-600 bg-clip-text text-transparent">
              every persona
            </span>
          </h1>
          <p className="mt-7 max-w-md text-lg text-haze">
            The full in-game compendium, mirrored. All {count} personas with
            their arcana, stats and elemental affinities, one click away.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#browse"
              className="shard bg-sees-500 px-8 py-4 font-display text-lg font-bold uppercase italic tracking-wide text-abyss shadow-[0_0_40px_-8px_rgba(31,143,255,0.8)] transition hover:bg-sees-400"
            >
              Open compendium
            </a>
          </div>
          <div className="mt-10 flex items-center gap-8 border-t border-edge/60 pt-6">
            <div>
              <p className="font-display text-4xl font-extrabold italic text-sees-400">
                {count}
              </p>
              <p className="text-xs uppercase tracking-widest text-haze">
                Personas
              </p>
            </div>
            <div>
              <p className="font-display text-4xl font-extrabold italic text-sees-400">
                22
              </p>
              <p className="text-xs uppercase tracking-widest text-haze">
                Arcana
              </p>
            </div>
          </div>
        </div>
        <div className="relative hidden md:grid grid-cols-2 gap-4">
          {showcase.map((persona, index) => (
            <div
              key={persona.id}
              className={`shard border border-edge bg-panel/80 p-5 backdrop-blur ${
                index % 2 ? "translate-y-7" : ""
              }`}
            >
              <PersonaImage
                persona={persona}
                className="mx-auto h-32 object-contain drop-shadow-[0_0_18px_rgba(31,143,255,0.35)]"
              />
              <p className="mt-3 font-display text-xl font-bold uppercase italic">
                {persona.name}
              </p>
              <p className="text-sm font-semibold uppercase tracking-wider text-sees-400">
                {persona.arcana}
              </p>
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
      <div className="mb-1 flex justify-between text-xs font-semibold uppercase tracking-wider text-haze">
        <span>{label}</span>
        <span className="text-frost">{value}</span>
      </div>
      <div className="h-1.5 bg-edge/60">
        <div
          className="h-1.5 bg-gradient-to-r from-sees-500 to-sees-400"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PersonaCard({
  persona,
  onSelect,
  marked,
}: {
  persona: Persona;
  onSelect: (persona: Persona) => void;
  marked: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(persona)}
      aria-pressed={marked}
      className={`group flex flex-col border bg-panel/60 p-5 text-left transition hover:-translate-y-1 hover:bg-panel hover:shadow-[0_0_30px_-10px_rgba(31,143,255,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sees-400 ${
        marked
          ? "border-sees-500 ring-2 ring-sees-500/50"
          : "border-edge/70 hover:border-sees-500/60"
      }`}
    >
      <div className="relative grid h-36 place-items-center bg-night">
        <PersonaImage
          persona={persona}
          className="h-32 object-contain transition group-hover:scale-105 group-hover:drop-shadow-[0_0_16px_rgba(31,143,255,0.45)]"
        />
        <span className="absolute left-2 top-2 bg-abyss/80 px-2 py-0.5 font-display text-xs font-bold italic text-haze">
          LV {persona.level}
        </span>
        {persona.dlc === 1 && (
          <span className="absolute right-2 top-2 bg-moon px-2 py-0.5 font-display text-xs font-bold italic text-abyss">
            DLC
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-xl font-bold uppercase italic leading-none">
        {persona.name}
      </p>
      <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-sees-400">
        {persona.arcana}
      </p>
    </button>
  );
}

function PersonaModal({
  persona,
  onClose,
}: {
  persona: Persona;
  onClose: () => void;
}) {
  const [zoom, setZoom] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // lock background scroll, move focus into the dialog, restore it on close
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (zoom) setZoom(false);
        else onClose();
        return;
      }
      if (event.key !== "Tab" || zoom) return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button, input, [tabindex]:not([tabindex="-1"])',
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
  }, [onClose, zoom]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={persona.name}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border border-edge bg-night p-8 shadow-[0_0_60px_-15px_rgba(31,143,255,0.6)] outline-none sm:max-w-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setZoom(true)}
              className="group relative grid h-28 w-28 shrink-0 place-items-center bg-panel focus-visible:outline focus-visible:outline-2 focus-visible:outline-sees-400"
              aria-label="Enlarge artwork"
            >
              <PersonaImage
                persona={persona}
                className="h-24 object-contain drop-shadow-[0_0_18px_rgba(31,143,255,0.4)]"
              />
              <span className="absolute bottom-1 right-1 bg-abyss/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-sees-400 opacity-0 transition group-hover:opacity-100">
                Zoom
              </span>
            </button>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-sees-400">
                {persona.arcana} · Lv {persona.level}
              </p>
              <h2 className="font-display text-5xl font-extrabold uppercase italic leading-none">
                {persona.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border border-edge text-haze transition hover:border-sees-500 hover:text-frost"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-6 leading-relaxed text-haze">{persona.description}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.3em] text-sees-400">
              Stats
            </h3>
            {STAT_KEYS.map((key) => (
              <StatBar
                key={key}
                label={STAT_LABELS[key]}
                value={persona[key]}
              />
            ))}
          </div>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.3em] text-sees-400">
              Affinities
            </h3>
            <div className="mt-3 space-y-3">
              {AFFINITIES.map(({ key, label, tone }) => {
                const values = persona[key] as string[];
                if (!values.length) return null;
                return (
                  <div
                    key={label}
                    className="flex flex-wrap items-center gap-x-2 gap-y-1"
                  >
                    <span className="w-20 shrink-0 text-sm font-semibold uppercase tracking-wider text-haze">
                      {label}
                    </span>
                    {values.map((value) => (
                      <span
                        key={value}
                        className={`px-3 py-1 text-xs font-semibold uppercase ${tone}`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                );
              })}
              {AFFINITIES.every(
                ({ key }) => !(persona[key] as string[]).length,
              ) && <p className="text-sm text-haze">No notable affinities.</p>}
            </div>
          </div>
        </div>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-abyss/95 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setZoom(false);
          }}
        >
          <PersonaImage
            persona={persona}
            className="max-h-[90vh] max-w-[90vw] object-contain drop-shadow-[0_0_50px_rgba(31,143,255,0.5)]"
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              setZoom(false);
            }}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center border border-edge text-haze transition hover:border-sees-500 hover:text-frost"
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
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-abyss/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compare personas"
    >
      <div
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border border-edge bg-night p-8 shadow-[0_0_60px_-15px_rgba(31,143,255,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold uppercase italic">
            Compare
          </h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border border-edge text-haze transition hover:border-sees-500 hover:text-frost"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-6">
          {[a, b].map((persona) => (
            <div key={persona.id} className="space-y-4">
              <div className="text-center">
                <PersonaImage
                  persona={persona}
                  className="mx-auto h-24 object-contain drop-shadow-[0_0_18px_rgba(31,143,255,0.4)]"
                />
                <p className="mt-2 font-display text-2xl font-bold uppercase italic leading-none">
                  {persona.name}
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-sees-400">
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
                  const values = persona[key] as string[];
                  if (!values.length) return null;
                  return (
                    <div
                      key={label}
                      className="flex flex-wrap items-center gap-1"
                    >
                      <span className="w-16 shrink-0 text-xs font-semibold uppercase tracking-wider text-haze">
                        {label}
                      </span>
                      {values.map((value) => (
                        <span
                          key={value}
                          className={`px-2 py-0.5 text-[10px] font-semibold uppercase ${tone}`}
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
      if (element !== "All" && !persona[affinityType].includes(element))
        return false;
      return true;
    });
    return [...filtered].sort(SORTERS[sort]);
  }, [personas, search, arcana, dlcFilter, element, affinityType, sort]);

  return (
    <div className="min-h-screen bg-abyss">
      <Navbar />
      <main>
        <Hero personas={personas} />

        <section id="browse" className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-5xl font-extrabold uppercase italic tracking-tight">
                The compendium
              </h2>
              <p className="mt-2 uppercase tracking-wider text-haze">
                {visible.length} of {personas.length || PERSONA_COUNT} personas
              </p>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name…"
              className="w-full border border-edge bg-panel px-5 py-3 text-frost placeholder:text-haze/70 outline-none transition focus:border-sees-500 md:w-72"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-haze">
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

            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-haze">
              <select
                value={affinityType}
                onChange={(event) =>
                  setAffinityType(event.target.value as AffinityKey)
                }
                className={SELECT_CLASS}
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
            </label>

            <div
              className="flex"
              role="group"
              aria-label="Filter by DLC"
            >
              {(
                [
                  ["all", "All"],
                  ["base", "Base"],
                  ["dlc", "DLC"],
                ] as [DlcFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setDlcFilter(value)}
                  className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sees-400 ${
                    dlcFilter === value
                      ? "bg-sees-500 text-abyss"
                      : "border border-edge bg-panel/50 text-haze hover:border-sees-500/60 hover:text-frost"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={toggleCompareMode}
              aria-pressed={compareMode}
              className={`ml-auto px-3 py-2 text-sm font-semibold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sees-400 ${
                compareMode
                  ? "bg-moon text-abyss"
                  : "border border-edge bg-panel/50 text-haze hover:border-sees-500/60 hover:text-frost"
              }`}
            >
              {compareMode ? "Comparing…" : "Compare"}
            </button>
          </div>

          {compareMode && (
            <p className="mt-3 text-sm uppercase tracking-wider text-moon">
              Pick two personas to compare ({compareList.length}/2).
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {arcanas.map((name) => (
              <button
                key={name}
                onClick={() => setArcana(name)}
                className={`px-4 py-1.5 text-sm font-semibold uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sees-400 ${
                  arcana === name
                    ? "bg-sees-500 text-abyss"
                    : "border border-edge bg-panel/50 text-haze hover:border-sees-500/60 hover:text-frost"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-10 border border-rose-500/40 bg-rose-500/10 p-5 text-rose-200">
              Could not load personas: {error}. Is the API running on :8000?
            </p>
          )}

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onSelect={onCardClick}
                marked={compareList.some((item) => item.id === persona.id)}
              />
            ))}
          </div>

          {!error && !visible.length && (
            <p className="mt-10 text-center uppercase tracking-wider text-haze">
              No personas match your filters.
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-edge/60 py-10 text-center text-sm uppercase tracking-wider text-haze">
        © boundlessend
      </footer>

      {selected && (
        <PersonaModal persona={selected} onClose={closePersona} />
      )}

      {compareList.length === 2 && (
        <CompareModal
          a={compareList[0]}
          b={compareList[1]}
          onClose={() => setCompareList([])}
        />
      )}
    </div>
  );
}
