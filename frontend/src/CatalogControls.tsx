import { ControlButton } from "./Controls";
import { Dropdown } from "./Dropdown";
import { SORT_LABELS, type SortKey } from "./constants";
import { type CatalogFilters } from "./useCatalogFilters";

// ряд контролов каталога: сортировка, тумблер Advanced, быстрые фильтры
// (No weakness / Favorites / Missing) и режимы Compare / Team / Shuffle
export function CatalogControls({
  cf,
  compareMode,
  teamMode,
  onToggleCompareMode,
  onToggleTeamMode,
  onShuffle,
}: {
  cf: CatalogFilters;
  compareMode: boolean;
  teamMode: boolean;
  onToggleCompareMode: () => void;
  onToggleTeamMode: () => void;
  onShuffle: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mut">
        Sort
        <Dropdown
          value={cf.sort}
          options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
            value: key,
            label: SORT_LABELS[key],
          }))}
          onChange={cf.setSort}
          ariaLabel="Sort"
        />
      </span>

      <ControlButton
        pressed={cf.advancedOpen}
        onClick={() => cf.setAdvancedOpen((prev) => !prev)}
      >
        Advanced{cf.advancedActive && <span className="text-blood"> •</span>}{" "}
        {cf.advancedOpen ? "▴" : "▾"}
      </ControlButton>

      <ControlButton
        pressed={cf.noWeakness}
        onClick={() => cf.setNoWeakness((on) => !on)}
        className="ml-auto"
      >
        No weakness
      </ControlButton>

      <ControlButton
        pressed={cf.favoritesOnly}
        onClick={() => cf.setFavoritesOnly((on) => !on)}
      >
        ★ Favorites
      </ControlButton>

      <ControlButton
        pressed={cf.missingOnly}
        onClick={() => cf.setMissingOnly((on) => !on)}
      >
        Missing
      </ControlButton>

      <ControlButton pressed={compareMode} onClick={onToggleCompareMode}>
        {compareMode ? "Comparing…" : "Compare"}
      </ControlButton>

      <ControlButton pressed={teamMode} onClick={onToggleTeamMode}>
        {teamMode ? "Team…" : "Team"}
      </ControlButton>

      <ControlButton onClick={onShuffle}>Shuffle</ControlButton>
    </div>
  );
}
