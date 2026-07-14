import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { ModalShell } from "./ModalShell";
import { useDialog } from "./useDialog";
import { usePersonas } from "./usePersonas";

type Entry = { type: string; label: string; hint: string; url: string };

// статичные секции всегда в индексе - быстрый прыжок между страницами
const PAGES: Entry[] = [
  { type: "Page", label: "Home", hint: "The compendium", url: "/" },
  { type: "Page", label: "The Arcana", hint: "All arcana", url: "/arcana/" },
  { type: "Page", label: "Skills", hint: "Skill catalog", url: "/skills/" },
  { type: "Page", label: "Bosses", hint: "Story bosses", url: "/bosses/" },
  { type: "Page", label: "Requests", hint: "Elizabeth's requests", url: "/requests/" },
];

// fuzzy по подпоследовательности: символы query идут по порядку в target. score -
// сумма разрывов между совпадениями (плотнее совпадение = меньше = выше в списке);
// null если символ не найден
function subsequenceScore(query: string, target: string): number | null {
  let from = 0;
  let score = 0;
  let previous = -1;
  for (const char of query) {
    const at = target.indexOf(char, from);
    if (at === -1) return null;
    if (previous !== -1) score += at - previous - 1;
    previous = at;
    from = at + 1;
  }
  return score;
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDialog(panelRef, onClose, true);
  // палитру вызывает сам пользователь (Cmd-K) - фокус в поиск ожидаем; программно,
  // после того как useDialog сфокусировал панель
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  const { personas } = usePersonas();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const entries = useMemo<Entry[]>(() => {
    const seenArcana = new Set<string>();
    const arcana: Entry[] = [];
    const persona: Entry[] = [];
    for (const item of personas) {
      if (!seenArcana.has(item.arcana)) {
        seenArcana.add(item.arcana);
        arcana.push({
          type: "Arcana",
          label: `${item.arcana} Arcana`,
          hint: "Arcana",
          url: `/arcana/${item.arcana.toLowerCase()}/`,
        });
      }
      persona.push({
        type: "Persona",
        label: item.name,
        hint: `${item.arcana} · Lv ${item.level}`,
        url: `/persona/${encodeURIComponent(item.query)}/`,
      });
    }
    return [...PAGES, ...arcana, ...persona];
  }, [personas]);

  const results = useMemo<Entry[]>(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return PAGES;
    const scored: { entry: Entry; score: number }[] = [];
    for (const entry of entries) {
      const score = subsequenceScore(needle, entry.label.toLowerCase());
      if (score !== null) scored.push({ entry, score });
    }
    scored.sort((a, b) => a.score - b.score);
    return scored.slice(0, 20).map((item) => item.entry);
  }, [query, entries]);

  // active мог указывать за пределы после сужения списка
  const activeIndex = results.length ? Math.min(active, results.length - 1) : 0;

  const go = (entry: Entry | undefined): void => {
    if (entry) window.location.href = entry.url;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[activeIndex]);
    }
  };

  return (
    <ModalShell
      label="Command palette"
      onClose={onClose}
      panelRef={panelRef}
      className="max-w-xl sm:mt-[10vh] sm:self-start"
    >
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls="palette-results"
        aria-label="Search personas, arcana and pages"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        placeholder="Search personas, arcana, pages…"
        className="w-full border-b-2 border-ink bg-transparent px-5 py-4 font-mono text-sm text-ink outline-none placeholder:text-mut"
      />
      <ul id="palette-results" role="listbox" className="max-h-[60vh] overflow-y-auto">
        {results.length === 0 && (
          <li className="px-5 py-4 font-mono text-xs uppercase tracking-wider text-mut">
            No matches
          </li>
        )}
        {results.map((entry, index) => (
          <li
            key={`${entry.type}:${entry.url}`}
            role="option"
            aria-selected={index === activeIndex}
            onMouseMove={() => setActive(index)}
            onClick={() => go(entry)}
            className={`flex cursor-pointer items-center gap-3 border-b border-ink/10 px-5 py-3 ${
              index === activeIndex ? "bg-ink text-paper" : "text-ink"
            }`}
          >
            <span
              className={`shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${
                index === activeIndex ? "border-paper/50" : "border-ink/30 text-mut"
              }`}
            >
              {entry.type}
            </span>
            <span className="truncate font-display text-base uppercase leading-none">
              {entry.label}
            </span>
            <span
              className={`ml-auto shrink-0 font-mono text-[11px] ${
                index === activeIndex ? "text-paper2" : "text-mut"
              }`}
            >
              {entry.hint}
            </span>
          </li>
        ))}
      </ul>
    </ModalShell>
  );
}
