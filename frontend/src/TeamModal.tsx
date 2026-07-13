import { useRef } from "react";
import type { Persona } from "./api";
import type { Skill } from "./useSkills";
import { PersonaImage } from "./PersonaImage";
import { useDialog } from "./useDialog";
import { teamCoverage, teamOffense } from "./teamCoverage";
import { IconButton } from "./Controls";
import { ModalShell } from "./ModalShell";
import { SectionHeading } from "./SectionHeading";

// разбор команды из 2-4 персон: чем бьёт (offense) и по каким стихиям слаба/
// прикрыта (defense), плюс exposed - слабость без прикрытия
export function TeamModal({
  team,
  skills,
  onClose,
}: {
  team: Persona[];
  skills: Record<string, Skill[]>;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onClose, true);

  const offense = teamOffense(team, skills);
  const offenseGaps = offense.filter((row) => row.by.length === 0);
  const rows = teamCoverage(team);
  const weaknesses = rows
    .filter((row) => row.weak.length > 0)
    .sort((a, b) => b.weak.length - a.weak.length);
  const resistances = rows.filter((row) => row.covered.length > 0);
  // слабость, которую никто в составе не прикрывает - главная опасность пати
  const exposed = weaknesses.filter((row) => row.covered.length === 0);

  return (
    <ModalShell
      label="Team coverage"
      onClose={onClose}
      panelRef={panelRef}
      className="max-w-3xl p-5 sm:p-8"
    >
      <div className="flex items-center justify-between border-b-2 border-ink pb-5">
          <div>
            <h2 className="font-display text-3xl uppercase">Team</h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mut">
              Offense & defense · {team.length} personas
            </p>
          </div>
          <IconButton onClick={onClose} ariaLabel="Close">
            ✕
          </IconButton>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {team.map((persona) => (
            <div key={persona.id} className="text-center">
              <PersonaImage
                persona={persona}
                className="mx-auto h-20 object-contain mix-blend-multiply"
              />
              <p className="mt-2 font-display text-lg uppercase leading-none break-words">
                {persona.name}
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-blood">
                {persona.arcana} · Lv {persona.level}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <SectionHeading>Offense</SectionHeading>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mut">
            Damage types this team can deal
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {offense.map((row) => {
              const covered = row.by.length > 0;
              return (
                <span
                  key={row.element}
                  title={
                    covered
                      ? `Dealt by ${row.by.join(", ")}`
                      : "No source in this team"
                  }
                  className={`border px-2 py-1 font-mono text-[10px] uppercase tracking-wide ${
                    covered
                      ? "border-ink bg-ink text-paper"
                      : "border-dashed border-mut text-mut"
                  }`}
                >
                  {row.element}
                  {covered && ` ·${row.by.length}`}
                </span>
              );
            })}
          </div>
          {offenseGaps.length > 0 && (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-mut">
              No source for: {offenseGaps.map((r) => r.element).join(", ")}
            </p>
          )}
        </div>

        {exposed.length > 0 && (
          <div className="mt-8 border-2 border-blood bg-blood/10 p-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-blood">
              Exposed · weak with no cover
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-mut">
              Nobody in the team resists these elements
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {exposed.map((row) => (
                <span
                  key={row.element}
                  className="bg-blood px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-paper"
                >
                  {row.element}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <section>
            <SectionHeading>Weaknesses</SectionHeading>
            <div className="mt-4 space-y-2">
              {weaknesses.length ? (
                weaknesses.map((row) => (
                  <div
                    key={row.element}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                  >
                    <span className="w-16 shrink-0 bg-blood px-2 py-1 text-center font-mono text-[10px] uppercase tracking-wide text-paper">
                      {row.element}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
                      {row.weak.length}/{team.length} weak ·{" "}
                      {row.covered.length ? (
                        <span className="text-ink">
                          covered by {row.covered.join(", ")}
                        </span>
                      ) : (
                        <span className="text-blood">no cover</span>
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <p className="font-mono text-sm text-mut">
                  No shared weaknesses.
                </p>
              )}
            </div>
          </section>

          <section>
            <SectionHeading>Resistances</SectionHeading>
            <div className="mt-4 space-y-2">
              {resistances.length ? (
                resistances.map((row) => (
                  <div
                    key={row.element}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                  >
                    <span className="w-16 shrink-0 border border-ink px-2 py-1 text-center font-mono text-[10px] uppercase tracking-wide text-ink">
                      {row.element}
                    </span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-mut">
                      {row.covered.join(", ")}
                    </span>
                  </div>
                ))
              ) : (
                <p className="font-mono text-sm text-mut">No resistances.</p>
              )}
            </div>
          </section>
        </div>
    </ModalShell>
  );
}
