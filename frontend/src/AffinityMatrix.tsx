import { AFFINITY_KEYS, type AffinityKey } from "./constants";
import type { Persona } from "./api";

// фиксированный порядок 9 стихий P3R (физические, затем магические) - сетка 3x3
// одинакова для всех персон, поэтому строки выравниваются при сравнении
const ELEMENTS: { name: string; label: string }[] = [
  { name: "Slash", label: "Slash" },
  { name: "Strike", label: "Strike" },
  { name: "Pierce", label: "Pierce" },
  { name: "Fire", label: "Fire" },
  { name: "Ice", label: "Ice" },
  { name: "Electric", label: "Elec" },
  { name: "Wind", label: "Wind" },
  { name: "Light", label: "Light" },
  { name: "Dark", label: "Dark" },
];

// состояние = глиф (не только цвет: читаемо ч/б), blood только у weak
const STATES: Record<AffinityKey, string> = {
  weak: "Wk",
  resists: "Rs",
  nullifies: "Nu",
  reflects: "Rp",
  absorbs: "Dr",
};

const LEGEND = "Wk weak · Rs resist · Nu null · Rp repel · Dr drain";

function stateOf(persona: Persona, element: string): AffinityKey | null {
  // стихия попадает максимум в один массив аффинити - первое совпадение финально
  for (const key of AFFINITY_KEYS) {
    if (persona[key].includes(element)) return key;
  }
  return null;
}

export function AffinityMatrix({ persona }: { persona: Persona }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {ELEMENTS.map(({ name, label }) => {
          const state = stateOf(persona, name);
          const weak = state === "weak";
          const code = state ? STATES[state] : "–";
          return (
            <div
              key={name}
              className={`flex flex-col items-center gap-0.5 border py-1.5 ${
                weak
                  ? "border-blood bg-blood text-paper"
                  : state
                    ? "border-ink text-ink"
                    : "border-ink/15 text-mut"
              }`}
            >
              <span
                className={`font-mono text-[9px] uppercase tracking-wider ${
                  weak ? "text-paper" : "text-mut"
                }`}
              >
                {label}
              </span>
              <span className="font-mono text-xs uppercase">{code}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mut">
        {LEGEND}
      </p>
    </div>
  );
}
