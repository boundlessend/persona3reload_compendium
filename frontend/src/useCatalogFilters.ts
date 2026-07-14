import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { type Persona } from "./api";
import {
  AFFINITY_FILTER_LABELS,
  AFFINITY_KEYS,
  SORTERS,
  type AffinityKey,
  type DlcFilter,
  type SortKey,
} from "./constants";
import { isSpecialFusion } from "./fusion";

// сколько карточек показывать за раз; loadMore догружает ещё столько же
const PAGE_SIZE = 48;

export type ActiveFilter = { id: string; label: string; clear: () => void };

export type CatalogFilters = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  arcana: string;
  setArcana: Dispatch<SetStateAction<string>>;
  origin: string;
  setOrigin: Dispatch<SetStateAction<string>>;
  sort: SortKey;
  setSort: Dispatch<SetStateAction<SortKey>>;
  element: string;
  setElement: Dispatch<SetStateAction<string>>;
  affinityType: AffinityKey;
  setAffinityType: Dispatch<SetStateAction<AffinityKey>>;
  element2: string;
  setElement2: Dispatch<SetStateAction<string>>;
  affinityType2: AffinityKey;
  setAffinityType2: Dispatch<SetStateAction<AffinityKey>>;
  levelMin: number;
  setLevelMin: Dispatch<SetStateAction<number>>;
  levelMax: number;
  setLevelMax: Dispatch<SetStateAction<number>>;
  dlcFilter: DlcFilter;
  setDlcFilter: Dispatch<SetStateAction<DlcFilter>>;
  favoritesOnly: boolean;
  setFavoritesOnly: Dispatch<SetStateAction<boolean>>;
  noWeakness: boolean;
  setNoWeakness: Dispatch<SetStateAction<boolean>>;
  missingOnly: boolean;
  setMissingOnly: Dispatch<SetStateAction<boolean>>;
  advancedOpen: boolean;
  setAdvancedOpen: Dispatch<SetStateAction<boolean>>;
  shown: number;
  loadMore: () => void;
  arcanas: string[];
  origins: string[];
  elements: string[];
  visible: Persona[];
  advancedActive: boolean;
  activeFilters: ActiveFilter[];
  clearAllFilters: () => void;
};

const DLC_LABELS: Record<DlcFilter, string> = {
  all: "All",
  base: "Base",
  dlc: "DLC",
  special: "Special",
};

// вся стейт-машина фильтров каталога и производные от неё (списки arcana/origin/
// element, visible-пайплайн, активные чипы, пагинация). вынесена из App, чтобы
// HomePage не был God-компонентом; URL-синхронизация - в useShareableFilters
export function useCatalogFilters(
  personas: Persona[],
  favorites: Set<string>,
  registered: Set<string>,
): CatalogFilters {
  const [search, setSearch] = useState("");
  // поле остаётся мгновенным на search; дорогой пересчёт каталога идёт по
  // отстающему deferredSearch, чтобы печать не блокировалась ре-рендером сетки
  const deferredSearch = useDeferredValue(search);
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
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [noWeakness, setNoWeakness] = useState(false);
  const [missingOnly, setMissingOnly] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);

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
    const term = deferredSearch.trim().toLowerCase();
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
    deferredSearch,
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
    deferredSearch,
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

  const loadMore = (): void => setShown((n) => n + PAGE_SIZE);

  // активны ли фильтры внутри Advanced - чтобы пометить кнопку, когда панель свёрнута
  const advancedActive =
    origin !== "All" ||
    element !== "All" ||
    element2 !== "All" ||
    levelMin !== 1 ||
    levelMax !== 99 ||
    dlcFilter !== "all";

  // сводка применённых фильтров убираемыми чипами над результатами; дефолт каждого
  // совпадает с useState выше, клик по чипу сбрасывает только своё условие
  const activeFilters: ActiveFilter[] = [];
  if (search.trim())
    activeFilters.push({
      id: "search",
      label: `Search: ${search.trim()}`,
      clear: () => setSearch(""),
    });
  if (arcana !== "All")
    activeFilters.push({ id: "arcana", label: arcana, clear: () => setArcana("All") });
  if (dlcFilter !== "all")
    activeFilters.push({
      id: "source",
      label: DLC_LABELS[dlcFilter],
      clear: () => setDlcFilter("all"),
    });
  if (element !== "All")
    activeFilters.push({
      id: "element",
      label: `${AFFINITY_FILTER_LABELS[affinityType]}: ${element}`,
      clear: () => setElement("All"),
    });
  if (element2 !== "All")
    activeFilters.push({
      id: "element2",
      label: `${AFFINITY_FILTER_LABELS[affinityType2]}: ${element2}`,
      clear: () => setElement2("All"),
    });
  if (levelMin !== 1 || levelMax !== 99)
    activeFilters.push({
      id: "level",
      label: `Lv ${Math.min(levelMin, levelMax)}-${Math.max(levelMin, levelMax)}`,
      clear: () => {
        setLevelMin(1);
        setLevelMax(99);
      },
    });
  if (origin !== "All")
    activeFilters.push({ id: "origin", label: origin, clear: () => setOrigin("All") });
  if (favoritesOnly)
    activeFilters.push({
      id: "favorites",
      label: "★ Favorites",
      clear: () => setFavoritesOnly(false),
    });
  if (noWeakness)
    activeFilters.push({
      id: "noWeakness",
      label: "No weakness",
      clear: () => setNoWeakness(false),
    });
  if (missingOnly)
    activeFilters.push({
      id: "missing",
      label: "Missing",
      clear: () => setMissingOnly(false),
    });

  const clearAllFilters = (): void => {
    setSearch("");
    setArcana("All");
    setOrigin("All");
    setElement("All");
    setElement2("All");
    setLevelMin(1);
    setLevelMax(99);
    setDlcFilter("all");
    setFavoritesOnly(false);
    setNoWeakness(false);
    setMissingOnly(false);
  };

  return {
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
  };
}
