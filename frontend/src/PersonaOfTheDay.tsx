import type { Persona } from "./api";
import { idTag } from "./constants";
import { PersonaImage } from "./PersonaImage";

// FNV-1a по строке даты: держит счёт в 32 битах (без потери точности больших
// произведений) и разбивает шаблон "завтра = следующий id"
function hashDate(text: string): number {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// детерминированный выбор по календарной дате: одна и та же персона весь день,
// смена в полночь по локальному времени пользователя
// ponytail: без учёта истории, за цикл персона может повториться - апгрейд при желании
function pickOfTheDay(personas: Persona[]): Persona | null {
  if (!personas.length) return null;
  const now = new Date();
  const key = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return personas[hashDate(key) % personas.length] ?? null;
}

// editorial-баннер с персоной дня; это ссылка (a[href]), а не button, чтобы не
// пересекаться с button-запросами в e2e и давать нативную навигацию по ctrl-клику
export function PersonaOfTheDay({
  personas,
  onSelect,
}: {
  personas: Persona[];
  onSelect: (persona: Persona) => void;
}) {
  const persona = pickOfTheDay(personas);
  if (!persona) return null;
  return (
    <a
      href={`/persona/${encodeURIComponent(persona.query)}/`}
      onClick={(event) => {
        // простой левый клик - клиентский роутинг; ctrl/cmd/средняя кнопка
        // уходят в нативную навигацию (открыть в новой вкладке)
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        )
          return;
        event.preventDefault();
        onSelect(persona);
      }}
      className="group flex items-center gap-4 border-2 border-ink bg-card p-4 transition hover:border-blood hover:shadow-[6px_6px_0_0_#16130d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood sm:gap-6 sm:p-5"
    >
      <PersonaImage
        persona={persona}
        className="h-16 w-16 shrink-0 object-contain mix-blend-multiply sm:h-20 sm:w-20"
      />
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-widest text-blood">
          Persona of the day
        </p>
        <p className="mt-1 font-display text-2xl uppercase leading-none break-words sm:text-3xl">
          {persona.name}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mut">
          {idTag(persona.id)} · {persona.arcana} · Lv {persona.level}
        </p>
      </div>
      <span className="ml-auto shrink-0 font-mono text-xs uppercase tracking-widest text-mut transition group-hover:text-blood">
        View →
      </span>
    </a>
  );
}
