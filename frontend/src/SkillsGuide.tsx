import { Fragment, useRef, type ReactNode } from "react";
import { SkillIcon, SkillIconDefs } from "./SkillIcon";
import { IconButton } from "./Controls";
import { ModalShell } from "./ModalShell";
import { SectionHeading } from "./SectionHeading";
import { useDialog } from "./useDialog";

// справочник «как формируются имена скиллов в P3R». открывается модалкой с блюром
// поверх /skills (как персоны), URL /skills/guide/ для deep-link. чистый справочник,
// без чисел (силу/SP сайт намеренно не показывает) - только морфология и ступени.
// названия и порядок выверены по megamitensei wiki / game8 (P3R).

type Ladder = { el: string; single: string[]; multi: string[] | null };

const DAMAGE: Ladder[] = [
  { el: "Fire", single: ["Agi", "Agilao", "Agidyne"], multi: ["Maragi", "Maragion", "Maragidyne"] },
  { el: "Ice", single: ["Bufu", "Bufula", "Bufudyne"], multi: ["Mabufu", "Mabufula", "Mabufudyne"] },
  { el: "Elec", single: ["Zio", "Zionga", "Ziodyne"], multi: ["Mazio", "Mazionga", "Maziodyne"] },
  { el: "Wind", single: ["Garu", "Garula", "Garudyne"], multi: ["Magaru", "Magarula", "Magarudyne"] },
  { el: "Light", single: ["Kouha", "Kouga", "Kougaon"], multi: ["Makouha", "Makouga", "Makougaon"] },
  { el: "Dark", single: ["Eiha", "Eiga", "Eigaon"], multi: ["Maeiha", "Maeiga", "Maeigaon"] },
  { el: "Almighty", single: ["Megido", "Megidola", "Megidolaon"], multi: null },
];

const RULES: [string, string][] = [
  [
    "Root = element",
    "Agi = Fire · Bufu = Ice · Zio = Elec · Garu = Wind · Kou / Hama = Light · Ei / Mudo = Dark · Megido = Almighty.",
  ],
  [
    "Ma- = all enemies",
    "Agi → Maragi, Bufu → Mabufu. For healing, Ma- / Me- covers the whole party instead: Dia → Media.",
  ],
  [
    "Suffix = power tier",
    "base → -la / -nga / -lao (medium) → -dyne / -on (heavy): Agi · Agilao · Agidyne.",
  ],
  [
    "-kaja / -nda / De-",
    "-kaja raises a stat (Tarukaja), -nda lowers it (Tarunda), De- dispels (Dekaja clears buffs, Dekunda clears debuffs).",
  ],
  [
    "Passives scale too",
    "Damage: X Boost is weaker than X Amp. Defense climbs Resist → Null → Repel → Drain (reduce → nullify → reflect → absorb).",
  ],
];

function Step({ name, tier }: { name: string; tier: number }) {
  const tone =
    tier >= 3
      ? "border-blood bg-blood font-bold text-paper"
      : tier === 2
        ? "border-ink bg-blood/10"
        : "border-ink";
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-xs ${tone}`}>
      {name}
    </span>
  );
}

function Line({ items, tag }: { items: string[]; tag?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tag && (
        <span className="border border-mut px-1 py-0.5 font-mono text-[9px] uppercase tracking-wider text-mut">
          {tag}
        </span>
      )}
      {items.map((name, i) => (
        <Fragment key={name}>
          {i > 0 && <span className="font-mono text-xs text-mut">→</span>}
          <Step name={name} tier={i + 1} />
        </Fragment>
      ))}
    </div>
  );
}

function Chip({ name, kind }: { name: string; kind: "up" | "down" | "flat" }) {
  const tone =
    kind === "down"
      ? "border-dashed border-mut text-mut"
      : kind === "flat"
        ? "border-ink bg-paper2"
        : "border-ink";
  return (
    <span className={`border px-1.5 py-0.5 font-mono text-xs ${tone}`}>
      {name}
    </span>
  );
}

function Heading({ children }: { children: string }) {
  return <SectionHeading className="mt-12">{children}</SectionHeading>;
}

function FamRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-ink/15 py-2.5">
      <span className="w-28 shrink-0 font-mono text-[11px] uppercase tracking-wider text-ink">
        {label}
      </span>
      {children}
    </div>
  );
}

// тело справочника без обёртки-модалки - секции от правил именования до пассивок
function SkillGuideContent() {
  return (
    <>
      <SkillIconDefs />
      <p className="mt-6 max-w-2xl leading-relaxed text-mut">
        Persona skill names are built from parts. Once you know the pattern you
        can read a skill you have never seen: its element, whether it hits one
        target or all, and roughly how strong it is. Heavy tiers are marked in
        red below.
      </p>

      <Heading>Naming rules</Heading>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {RULES.map(([key, value]) => (
          <div key={key} className="border-l-[3px] border-blood pl-4">
            <p className="font-mono text-xs font-bold uppercase tracking-wider">
              {key}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mut">{value}</p>
          </div>
        ))}
      </div>

      <Heading>Damage ladders</Heading>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {DAMAGE.map(({ el, single, multi }) => (
          <div key={el} className="border-2 border-ink bg-card p-4">
            <div className="mb-3 flex items-center gap-2 font-display text-sm uppercase leading-none">
              <SkillIcon el={el} className="h-4 w-4 shrink-0" />
              {el}
            </div>
            <Line items={single} />
            {multi && (
              <div className="mt-2">
                <Line items={multi} tag="Ma-" />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-mut">
        Almighty ignores resistances and is always multi-target, so it has no
        Ma- split.
      </p>

      <Heading>Instant kill · Light & Dark</Heading>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-mut">
        Separate from the damage lines above, Light and Dark each carry an
        instant-kill line that either works or misses, scaled by hit rate.
        Bosses are always immune.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="border-2 border-ink bg-card p-4">
          <div className="mb-3 flex items-center gap-2 font-display text-sm uppercase leading-none">
            <SkillIcon el="Light" className="h-4 w-4 shrink-0" />
            Light · Hama
          </div>
          <Line items={["Hama", "Hamaon"]} />
          <div className="mt-2">
            <Line items={["Mahama", "Mahamaon"]} tag="Ma-" />
          </div>
        </div>
        <div className="border-2 border-ink bg-card p-4">
          <div className="mb-3 flex items-center gap-2 font-display text-sm uppercase leading-none">
            <SkillIcon el="Dark" className="h-4 w-4 shrink-0" />
            Dark · Mudo
          </div>
          <Line items={["Mudo", "Mudoon"]} />
          <div className="mt-2">
            <Line items={["Mamudo", "Mamudoon"]} tag="Ma-" />
          </div>
        </div>
      </div>

      <Heading>Buffs · debuffs · dispel</Heading>
      <div className="mt-4">
        <FamRow label="Attack">
          <Chip name="Tarukaja" kind="up" />
          <Chip name="Tarunda" kind="down" />
        </FamRow>
        <FamRow label="Defense">
          <Chip name="Rakukaja" kind="up" />
          <Chip name="Rakunda" kind="down" />
        </FamRow>
        <FamRow label="Hit / Evade">
          <Chip name="Sukukaja" kind="up" />
          <Chip name="Sukunda" kind="down" />
        </FamRow>
        <FamRow label="All three">
          <Chip name="Heat Riser" kind="up" />
          <span className="font-mono text-[11px] text-mut">one ally, up</span>
          <Chip name="Debilitate" kind="down" />
          <span className="font-mono text-[11px] text-mut">one enemy, down</span>
        </FamRow>
        <FamRow label="Whole party">
          <span className="font-mono text-[11px] text-mut">
            add Ma-: Matarukaja · Marakukaja · Masukukaja · Matarunda …
          </span>
        </FamRow>
        <FamRow label="Dispel">
          <Chip name="Dekaja" kind="flat" />
          <span className="font-mono text-[11px] text-mut">clears buffs</span>
          <Chip name="Dekunda" kind="flat" />
          <span className="font-mono text-[11px] text-mut">clears debuffs</span>
        </FamRow>
        <FamRow label="One-shot setup">
          <Chip name="Charge" kind="flat" />
          <Chip name="Concentrate" kind="flat" />
          <span className="font-mono text-[11px] text-mut">
            next physical / magic hit lands far harder
          </span>
        </FamRow>
        <FamRow label="Reflect once">
          <Chip name="Tetrakarn" kind="flat" />
          <span className="font-mono text-[11px] text-mut">physical</span>
          <Chip name="Makarakarn" kind="flat" />
          <span className="font-mono text-[11px] text-mut">magic</span>
        </FamRow>
      </div>

      <Heading>Recovery</Heading>
      <div className="mt-4">
        <FamRow label="Heal · one">
          <Line items={["Dia", "Diarama", "Diarahan"]} />
        </FamRow>
        <FamRow label="Heal · party">
          <Line items={["Media", "Mediarama", "Mediarahan"]} />
        </FamRow>
        <FamRow label="Revive">
          <Chip name="Recarm" kind="flat" />
          <Chip name="Samarecarm" kind="flat" />
          <span className="font-mono text-[11px] text-mut">
            back on their feet, full HP
          </span>
        </FamRow>
        <FamRow label="Recarmdra">
          <span className="font-mono text-[11px] text-mut">
            heals the living party to full, but drops the caster to 1 HP - not a
            revive
          </span>
        </FamRow>
        <FamRow label="Cure status">
          <Chip name="Patra" kind="flat" />
          <Chip name="Me Patra" kind="flat" />
          <Chip name="Amrita Drop" kind="flat" />
          <Chip name="Amrita Shower" kind="flat" />
        </FamRow>
      </div>

      <Heading>Passives</Heading>
      <div className="mt-4">
        <FamRow label="More damage">
          <Line items={["Fire Boost", "Fire Amp"]} />
          <span className="font-mono text-[11px] text-mut">
            same pattern for every element
          </span>
        </FamRow>
        <FamRow label="Take less">
          <Line items={["Resist", "Null", "Repel", "Drain"]} />
          <span className="font-mono text-[11px] text-mut">
            reduce → nullify → reflect → absorb
          </span>
        </FamRow>
        <FamRow label="On battle start">
          <span className="font-mono text-[11px] text-mut">
            Auto-Tarukaja · Auto-Rakukaja · Auto-Sukukaja apply their buff for
            free
          </span>
        </FamRow>
        <FamRow label="Tiered 1 → 3">
          <span className="font-mono text-[11px] text-mut">
            Growth · Invigorate · Regenerate count up as they get stronger
          </span>
        </FamRow>
      </div>
    </>
  );
}

// модалка с блюром поверх /skills, тот же оверлей, что и у персон
export function SkillGuideModal({ onClose }: { onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onClose, true);

  return (
    <ModalShell
      label="How skills work"
      onClose={onClose}
      panelRef={panelRef}
      className="max-w-3xl p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-5">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-blood">
            Skill library · Guide
          </p>
          <h2 className="mt-1 font-display text-3xl uppercase leading-none sm:text-4xl">
            How skills work
          </h2>
        </div>
        <IconButton onClick={onClose} ariaLabel="Close">
          ✕
        </IconButton>
      </div>
      <SkillGuideContent />
    </ModalShell>
  );
}
