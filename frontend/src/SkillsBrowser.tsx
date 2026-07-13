import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { Persona } from "./api";
import { useSkills } from "./useSkills";
import { usePersonas } from "./usePersonas";
import { useFavorites } from "./useFavorites";
import { useRegistered } from "./useRegistered";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ErrorNote } from "./ErrorNote";
import { Chip } from "./Controls";
import { SkillIcon, SkillIconDefs } from "./SkillIcon";
import { SkillGuideModal } from "./SkillsGuide";
import { PersonaImage } from "./PersonaImage";
import { usePersonaModal } from "./usePersonaModal";

const GUIDE_PATH = /^\/skills\/guide\/?$/;

// страница /skills: каталог всех скиллов (имя, стихия, цель, сколько персон учит),
// с фильтром по стихии/типу. Клик по скиллу раскрывает под плиткой персон, которые
// его учат; клик по персоне открывает её модалку с блюром прямо здесь.
// гайд по именованию открывается модалкой с блюром (deep-link /skills/guide/)
export function SkillsBrowser({ initialGuideOpen }: { initialGuideOpen: boolean }) {
  const { skills, loading, error } = useSkills();
  const { personas } = usePersonas();
  const { favorites, toggleFavorite } = useFavorites();
  const { registered, toggleRegistered } = useRegistered();
  const { open: openPersona, modal: personaModal } = usePersonaModal(
    personas,
    skills,
    favorites,
    toggleFavorite,
    registered,
    toggleRegistered,
  );
  // начальная стихия из ?element= (сюда ведут counter-ссылки со страницы /bosses)
  const [element, setElement] = useState(
    () => new URLSearchParams(window.location.search).get("element") ?? "All",
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(initialGuideOpen);
  // мы ли положили запись /skills/guide/ в историю: решает, back или replace на закрытии
  const guidePushedRef = useRef(false);

  useEffect(() => {
    const onPop = () => {
      guidePushedRef.current = false;
      setGuideOpen(GUIDE_PATH.test(window.location.pathname));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // смена фильтра скрывает открытый скилл из visible - сбрасываем раскрытие,
  // чтобы не оставлять висящее состояние без видимой строки
  useEffect(() => {
    setExpanded(null);
  }, [element]);

  const openGuide = () => {
    setGuideOpen(true);
    window.history.pushState(null, "", "/skills/guide/");
    guidePushedRef.current = true;
  };
  const closeGuide = () => {
    setGuideOpen(false);
    // снять свою запись, чтобы Back не открыл модалку снова; на прямом заходе
    // (нашей записи нет) заменяем на /skills/, чтобы не уйти с сайта
    if (guidePushedRef.current) {
      guidePushedRef.current = false;
      window.history.back();
    } else if (window.location.pathname !== "/skills/") {
      window.history.replaceState(null, "", "/skills/");
    }
  };

  const catalog = useMemo(() => {
    const map = new Map<
      string,
      { el: string; tg: string; e?: string; count: number }
    >();
    for (const list of Object.values(skills)) {
      for (const skill of list) {
        const entry = map.get(skill.n);
        if (entry) entry.count += 1;
        else map.set(skill.n, { el: skill.el, tg: skill.tg, e: skill.e, count: 1 });
      }
    }
    return Array.from(map, ([name, value]) => ({ name, ...value })).sort(
      (a, b) => a.el.localeCompare(b.el) || a.name.localeCompare(b.name),
    );
  }, [skills]);

  const elements = useMemo(
    () => ["All", ...Array.from(new Set(catalog.map((s) => s.el))).sort()],
    [catalog],
  );

  // обратная карта: имя скилла -> персоны, которые его учат (по возрастанию уровня)
  const ownersBySkill = useMemo(() => {
    const byQuery = new Map(personas.map((persona) => [persona.query, persona]));
    const map = new Map<string, Persona[]>();
    for (const [query, list] of Object.entries(skills)) {
      const persona = byQuery.get(query);
      if (!persona) continue;
      for (const skill of list) {
        const arr = map.get(skill.n);
        if (arr) arr.push(persona);
        else map.set(skill.n, [persona]);
      }
    }
    for (const arr of map.values()) arr.sort((a, b) => a.level - b.level);
    return map;
  }, [personas, skills]);

  const visible = useMemo(
    () => catalog.filter((s) => element === "All" || s.el === element),
    [catalog, element],
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="font-mono text-sm tracking-[0.1em] text-blood">
          SKILL LIBRARY
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
          Skills
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-mut">
          Every skill personas learn in Persona 3 Reload, with its element and
          target. SP cost is not tracked here.
        </p>

        <a
          href="/skills/guide/"
          onClick={(event) => {
            // обычный клик открывает модалку; ctrl/cmd/middle-click ведут по href
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            openGuide();
          }}
          aria-haspopup="dialog"
          className="mt-6 inline-flex items-center gap-2 border-2 border-ink bg-card px-4 py-2 font-mono text-xs uppercase tracking-wider transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
        >
          How skills are named →
        </a>

        <div className="mt-10 flex flex-wrap gap-2">
          {elements.map((name) => (
            <Chip
              key={name}
              pressed={element === name}
              onClick={() => setElement(name)}
              className="px-3 text-[11px]"
            >
              {name}
            </Chip>
          ))}
        </div>

        <p
          aria-live="polite"
          className="mt-6 font-mono text-xs uppercase tracking-wider text-mut"
        >
          {loading ? "Loading…" : `${visible.length} skills`}
        </p>

        {error && <ErrorNote message={`Could not load skills: ${error}.`} />}

        <SkillIconDefs />
        <div className="mt-4 grid grid-flow-row-dense border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => {
            const isOpen = expanded === skill.name;
            const owners = isOpen ? (ownersBySkill.get(skill.name) ?? []) : [];
            const panelId = `skill-owners-${skill.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
            return (
              <Fragment key={skill.name}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={isOpen ? panelId : undefined}
                  onClick={() => setExpanded(isOpen ? null : skill.name)}
                  className={`group flex flex-col border-b-2 border-r-2 border-ink bg-card p-4 text-left transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${isOpen ? "outline outline-2 -outline-offset-2 outline-blood" : ""}`}
                >
                  <span className="flex items-center gap-2 font-display text-lg uppercase leading-none break-words">
                    <SkillIcon
                      el={skill.el}
                      className="h-5 w-5 shrink-0 group-hover:text-paper!"
                    />
                    {skill.name}
                  </span>
                  <span className="mt-2 font-mono text-[11px] uppercase tracking-wider text-blood group-hover:text-[#ff8a9b]">
                    {skill.el} · {skill.tg}
                  </span>
                  {skill.e && (
                    <span className="mt-1 font-mono text-[11px] text-mut group-hover:text-paper2">
                      {skill.e}
                    </span>
                  )}
                  <span className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mut group-hover:text-paper2">
                    {isOpen ? "Hide" : "Show"} {skill.count}{" "}
                    {skill.count === 1 ? "persona" : "personas"}{" "}
                    {isOpen ? "▴" : "▾"}
                  </span>
                </button>

                {isOpen && (
                  <div
                    id={panelId}
                    className="col-span-full border-b-2 border-r-2 border-ink bg-paper2 p-5"
                  >
                    <p className="font-mono text-[11px] uppercase tracking-widest text-mut">
                      {owners.length}{" "}
                      {owners.length === 1 ? "persona learns" : "personas learn"}{" "}
                      {skill.name}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-5">
                      {owners.map((persona) => (
                        <button
                          key={persona.id}
                          type="button"
                          onClick={() => openPersona(persona)}
                          className="flex w-20 flex-col items-center gap-1.5 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
                        >
                          <PersonaImage
                            persona={persona}
                            className="h-16 w-16 object-contain mix-blend-multiply transition motion-safe:hover:scale-105"
                          />
                          <span className="font-mono text-[10px] uppercase leading-tight text-ink">
                            {persona.name}
                          </span>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-blood">
                            Lv {persona.level}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </main>
      <Footer />

      {guideOpen && <SkillGuideModal onClose={closeGuide} />}

      {personaModal}
    </div>
  );
}
