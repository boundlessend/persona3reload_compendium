import { useEffect, useRef } from "react";
import { MAX_STAT, STAT_KEYS, type Persona } from "./api";
import { STAT_LABELS } from "./constants";

function StatBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, (value / MAX_STAT) * 100);
  const barRef = useRef<HTMLDivElement>(null);
  // ширина задаётся через CSSOM, а не инлайн-атрибут style: CSSOM-правки не
  // подпадают под style-src-attr, поэтому CSP обходится без 'unsafe-inline'
  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${pct}%`;
  }, [pct]);
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[11px] uppercase tracking-wider text-mut">
        <span>{label}</span>
        <span className="text-ink">{value}</span>
      </div>
      <div className="h-2 border border-ink">
        <div ref={barRef} className="h-full bg-ink" />
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
