import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { type Persona } from "./api";
import { AFFINITY_KEYS, type AffinityKey } from "./constants";
import { type CatalogFilters } from "./useCatalogFilters";

// единственный владелец URL на главной: восстановление фильтров/сравнения/команды
// из строки запроса при заходе по расшаренной ссылке и обратное отражение их в URL
// (replaceState). раньше это были два эффекта прямо в App - сведены сюда, чтобы за
// window.history отвечало одно место (см. audit #17)
export function useShareableFilters(params: {
  personas: Persona[];
  selected: Persona | null;
  filters: CatalogFilters;
  compareList: Persona[];
  setCompareMode: Dispatch<SetStateAction<boolean>>;
  setCompareList: Dispatch<SetStateAction<Persona[]>>;
  teamList: Persona[];
  teamOpen: boolean;
  setTeamMode: Dispatch<SetStateAction<boolean>>;
  setTeamList: Dispatch<SetStateAction<Persona[]>>;
  setTeamOpen: Dispatch<SetStateAction<boolean>>;
}): void {
  const {
    personas,
    selected,
    filters,
    compareList,
    setCompareMode,
    setCompareList,
    teamList,
    teamOpen,
    setTeamMode,
    setTeamList,
    setTeamOpen,
  } = params;
  const {
    arcana,
    setArcana,
    search,
    setSearch,
    dlcFilter,
    setDlcFilter,
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
    origin,
    setOrigin,
    noWeakness,
    setNoWeakness,
  } = filters;

  // восстановить фильтры/сравнение/команду из query при заходе по расшаренной ссылке
  useEffect(() => {
    if (!personas.length) return;
    // восстанавливаем только на главной; страница персоны (/persona/<q>/) владеет
    // своим состоянием отдельно
    if (window.location.pathname !== "/") return;
    const params = new URLSearchParams(window.location.search);

    // фильтры данных. неизвестные строковые значения (arcana/origin/element) просто
    // дадут пустую выдачу - чип D7 позволит их снять; типизированные (affinity/source/
    // level) валидируем, т.к. они сужены до union/числа
    const affinityFromParam = (value: string | null): AffinityKey | null =>
      value !== null && (AFFINITY_KEYS as readonly string[]).includes(value)
        ? (value as AffinityKey)
        : null;
    const arcanaParam = params.get("arcana");
    if (arcanaParam) setArcana(arcanaParam);
    const searchParam = params.get("q");
    if (searchParam) setSearch(searchParam);
    const sourceParam = params.get("source");
    if (sourceParam === "base" || sourceParam === "dlc" || sourceParam === "special")
      setDlcFilter(sourceParam);
    const elementParam = params.get("el");
    if (elementParam) {
      const key = affinityFromParam(params.get("aff"));
      if (key) setAffinityType(key);
      setElement(elementParam);
    }
    const element2Param = params.get("el2");
    if (element2Param) {
      const key = affinityFromParam(params.get("aff2"));
      if (key) setAffinityType2(key);
      setElement2(element2Param);
    }
    const levelMinParam = Number(params.get("lmin"));
    if (Number.isInteger(levelMinParam) && levelMinParam >= 1 && levelMinParam <= 99)
      setLevelMin(levelMinParam);
    const levelMaxParam = Number(params.get("lmax"));
    if (Number.isInteger(levelMaxParam) && levelMaxParam >= 1 && levelMaxParam <= 99)
      setLevelMax(levelMaxParam);
    const originParam = params.get("origin");
    if (originParam) setOrigin(originParam);
    if (params.get("noweak") === "1") setNoWeakness(true);

    const resolve = (slugs: string): Persona[] =>
      slugs
        .split(",")
        .map((slug) => personas.find((p) => p.query === slug))
        .filter((p): p is Persona => Boolean(p));
    // compare и team взаимоисключающие; но если compare-ссылка битая (<2 валидных),
    // не проглатываем её - падаем на team, если та валидна
    const compareParam = params.get("compare");
    const comparePicks = compareParam ? resolve(compareParam) : [];
    if (comparePicks.length >= 2) {
      setCompareMode(true);
      setCompareList(comparePicks.slice(0, 2));
    } else {
      const teamParam = params.get("team");
      const teamPicks = teamParam ? resolve(teamParam) : [];
      if (teamPicks.length >= 2) {
        setTeamMode(true);
        setTeamList(teamPicks.slice(0, 4));
        setTeamOpen(true);
      }
    }
    // восстановление один раз при загрузке данных: personas меняется один раз
    // (сеттеры стабильны, поэтому в deps не вызывают повторов)
  }, [
    personas,
    setArcana,
    setSearch,
    setDlcFilter,
    setAffinityType,
    setElement,
    setAffinityType2,
    setElement2,
    setLevelMin,
    setLevelMax,
    setOrigin,
    setNoWeakness,
    setCompareMode,
    setCompareList,
    setTeamMode,
    setTeamList,
    setTeamOpen,
  ]);

  // последний share-URL, что МЫ записали: чтобы убирать query только за собой,
  // не затирая ?compare/?team из входящей ссылки до того, как её прочтёт restore
  const sharedUrlRef = useRef<string | null>(null);

  // отразить фильтры/сравнение/команду в URL (replaceState: без новых записей
  // истории). Персона-модалка владеет своим путём отдельно, поэтому пропускаем
  useEffect(() => {
    if (selected) return;
    const params = new URLSearchParams();
    if (arcana !== "All") params.set("arcana", arcana);
    const term = search.trim();
    if (term) params.set("q", term);
    if (dlcFilter !== "all") params.set("source", dlcFilter);
    if (element !== "All") {
      params.set("aff", affinityType);
      params.set("el", element);
    }
    if (element2 !== "All") {
      params.set("aff2", affinityType2);
      params.set("el2", element2);
    }
    if (levelMin !== 1) params.set("lmin", String(levelMin));
    if (levelMax !== 99) params.set("lmax", String(levelMax));
    if (origin !== "All") params.set("origin", origin);
    if (noWeakness) params.set("noweak", "1");
    const a = compareList[0];
    const b = compareList[1];
    if (a && b) params.set("compare", `${a.query},${b.query}`);
    else if (teamOpen && teamList.length >= 2)
      params.set("team", teamList.map((p) => p.query).join(","));

    const query = params.toString();
    if (query) {
      const next = `/?${query}`;
      if (next !== sharedUrlRef.current) {
        window.history.replaceState(null, "", next);
        sharedUrlRef.current = next;
      }
    } else if (sharedUrlRef.current) {
      // все наши условия сняли - убрать query, не трогая путь
      window.history.replaceState(null, "", window.location.pathname);
      sharedUrlRef.current = null;
    }
  }, [
    arcana,
    search,
    dlcFilter,
    element,
    affinityType,
    element2,
    affinityType2,
    levelMin,
    levelMax,
    origin,
    noWeakness,
    compareList,
    teamOpen,
    teamList,
    selected,
  ]);
}
