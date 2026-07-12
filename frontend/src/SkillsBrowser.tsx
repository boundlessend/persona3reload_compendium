import { useMemo, useState } from "react";
import { useSkills } from "./useSkills";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Chip } from "./Controls";

// страница /skills: каталог всех скиллов (имя, стихия, цель, сколько персон учит),
// с фильтром по стихии/типу. Клик по числу учащих не делаем - список велик
export function SkillsBrowser() {
  const { skills, loading } = useSkills();
  const [element, setElement] = useState("All");

  const catalog = useMemo(() => {
    const map = new Map<string, { el: string; tg: string; count: number }>();
    for (const list of Object.values(skills)) {
      for (const skill of list) {
        const entry = map.get(skill.n);
        if (entry) entry.count += 1;
        else map.set(skill.n, { el: skill.el, tg: skill.tg, count: 1 });
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

  const visible = catalog.filter((s) => element === "All" || s.el === element);

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
          target. SP cost is omitted on purpose.
        </p>

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

        <p className="mt-6 font-mono text-xs uppercase tracking-wider text-mut">
          {loading ? "Loading…" : `${visible.length} skills`}
        </p>

        <div className="mt-4 grid border-l-2 border-t-2 border-ink sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => (
            <div
              key={skill.name}
              className="flex flex-col border-b-2 border-r-2 border-ink bg-card p-4"
            >
              <span className="font-display text-lg uppercase leading-none break-words">
                {skill.name}
              </span>
              <span className="mt-2 font-mono text-[11px] uppercase tracking-wider text-blood">
                {skill.el} · {skill.tg}
              </span>
              <span className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mut">
                {skill.count} {skill.count === 1 ? "persona" : "personas"}
              </span>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
