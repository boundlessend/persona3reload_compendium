import { MAX_STAT, STAT_KEYS, type Persona } from "./api";

// плоский пентагон-радар пяти статов: ink-сетка, 2px ink-контур данных, 15% blood-
// заливка. значения проецируются как доля от MAX_STAT по осям с шагом 72°
const CENTER = 100;
const RADIUS = 68;
const ABBR: Record<(typeof STAT_KEYS)[number], string> = {
  strength: "STR",
  magic: "MAG",
  endurance: "END",
  agility: "AGI",
  luck: "LCK",
};

function vertex(index: number, ratio: number): [number, number] {
  // первый стат сверху (-90°), дальше по часовой
  const angle = ((-90 + index * 72) * Math.PI) / 180;
  return [
    CENTER + RADIUS * ratio * Math.cos(angle),
    CENTER + RADIUS * ratio * Math.sin(angle),
  ];
}

function polygon(ratio: number): string {
  return STAT_KEYS.map((_, index) => vertex(index, ratio).join(",")).join(" ");
}

export function StatRadar({ persona }: { persona: Persona }) {
  const dataPoints = STAT_KEYS.map((key, index) =>
    vertex(index, Math.min(1, persona[key] / MAX_STAT)).join(","),
  ).join(" ");

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label="Stat radar"
      className="mx-auto w-full max-w-[200px]"
    >
      {/* концентрическая ink-сетка */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={polygon(ratio)}
          className="fill-none stroke-ink/20"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {/* спицы к вершинам */}
      {STAT_KEYS.map((_, index) => {
        const [x, y] = vertex(index, 1);
        return (
          <line
            key={index}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            className="stroke-ink/20"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}
      {/* контур данных: 2px ink, 15% blood-заливка */}
      <polygon
        points={dataPoints}
        className="fill-blood/15 stroke-ink"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />
      {STAT_KEYS.map((key, index) => {
        const [dx, dy] = vertex(index, 1);
        const [lx, ly] = vertex(index, 1.28);
        return (
          <g key={key}>
            <circle cx={dx} cy={dy} r={2} className="fill-ink" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              className="fill-mut font-mono"
            >
              {ABBR[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
