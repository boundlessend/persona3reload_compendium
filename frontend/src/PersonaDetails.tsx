import { MAX_STAT, STAT_KEYS, type Persona } from "./api";
import { AFFINITIES, STAT_LABELS } from "./constants";

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / MAX_STAT) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-wider text-mut">
        <span>{label}</span>
        <span className="text-ink">{value}</span>
      </div>
      <div className="h-2 border border-ink">
        <div className="h-full bg-ink" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// five stat bars for a persona; shared by the detail and compare dialogs
export function StatList({ persona }: { persona: Persona }) {
  return (
    <div className="space-y-3">
      {STAT_KEYS.map((key) => (
        <StatBar key={key} label={STAT_LABELS[key]} value={persona[key]} />
      ))}
    </div>
  );
}

// grouped elemental affinity badges; shared by the detail and compare dialogs
export function AffinityList({ persona }: { persona: Persona }) {
  const hasAny = AFFINITIES.some(({ key }) => persona[key].length);
  return (
    <div className="space-y-2">
      {AFFINITIES.map(({ key, label, tone }) => {
        const values = persona[key];
        if (!values.length) return null;
        return (
          <div
            key={label}
            className="flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <span className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-wider text-mut">
              {label}
            </span>
            {values.map((value) => (
              <span
                key={value}
                className={`px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${tone}`}
              >
                {value}
              </span>
            ))}
          </div>
        );
      })}
      {!hasAny && (
        <p className="font-mono text-sm text-mut">No notable affinities.</p>
      )}
    </div>
  );
}
