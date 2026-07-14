import { type ActiveFilter } from "./useCatalogFilters";

// сводка применённых фильтров убираемыми чипами над результатами; клик по чипу
// сбрасывает только своё условие, "Clear all" - все сразу
export function ActiveFilterChips({
  filters,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onClearAll: () => void;
}) {
  if (!filters.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
        Filters
      </span>
      {filters.map((filter) => (
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
      {filters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="font-mono text-[11px] uppercase tracking-wider text-blood underline underline-offset-2 transition hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
