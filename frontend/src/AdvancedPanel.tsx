import { Dropdown } from "./Dropdown";
import {
  AFFINITY_FILTER_LABELS,
  AFFINITY_KEYS,
  type DlcFilter,
} from "./constants";
import { type CatalogFilters } from "./useCatalogFilters";

// раскрываемая панель расширенных фильтров: две аффинити-пары (стихия + отношение),
// диапазон уровней, происхождение и источник (base / DLC / special-fusion)
export function AdvancedPanel({ cf }: { cf: CatalogFilters }) {
  return (
    <div className="mt-4 border-2 border-ink bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-blood">
            Affinity
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              value={cf.affinityType}
              options={AFFINITY_KEYS.map((key) => ({
                value: key,
                label: AFFINITY_FILTER_LABELS[key],
              }))}
              onChange={cf.setAffinityType}
              ariaLabel="Affinity type"
            />
            <Dropdown
              value={cf.element}
              options={cf.elements.map((name) => ({
                value: name,
                label: name === "All" ? "Any element" : name,
              }))}
              onChange={cf.setElement}
              ariaLabel="Element"
            />
            <span
              className="font-mono text-[11px] uppercase tracking-wider text-mut"
              aria-hidden="true"
            >
              and
            </span>
            <Dropdown
              value={cf.affinityType2}
              options={AFFINITY_KEYS.map((key) => ({
                value: key,
                label: AFFINITY_FILTER_LABELS[key],
              }))}
              onChange={cf.setAffinityType2}
              ariaLabel="Second affinity type"
            />
            <Dropdown
              value={cf.element2}
              options={cf.elements.map((name) => ({
                value: name,
                label: name === "All" ? "Any element" : name,
              }))}
              onChange={cf.setElement2}
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
              value={cf.levelMin}
              onChange={(event) =>
                cf.setLevelMin(
                  Math.max(1, Math.min(99, Number(event.target.value) || 1)),
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
              value={cf.levelMax}
              onChange={(event) =>
                cf.setLevelMax(
                  Math.max(1, Math.min(99, Number(event.target.value) || 99)),
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
            value={cf.origin}
            options={cf.origins.map((name) => ({
              value: name,
              label: name === "All" ? "Any origin" : name,
            }))}
            onChange={cf.setOrigin}
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
                onClick={() => cf.setDlcFilter(value)}
                aria-pressed={cf.dlcFilter === value}
                className={`px-3 py-2 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                  index < 3 ? "border-r-2 border-ink" : ""
                } ${
                  cf.dlcFilter === value
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
  );
}
