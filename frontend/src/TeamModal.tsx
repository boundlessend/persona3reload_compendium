import { useRef } from "react";
import type { Persona } from "./api";
import { PersonaImage } from "./PersonaImage";
import { useDialog } from "./useDialog";
import { teamCoverage } from "./teamCoverage";

// защитный разбор команды из 2-4 персон: общие слабости, прикрытие, exposed
export function TeamModal({
  team,
  onClose,
}: {
  team: Persona[];
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onClose, true);

  const rows = teamCoverage(team);
  const weaknesses = rows
    .filter((row) => row.weak.length > 0)
    .sort((a, b) => b.weak.length - a.weak.length);
  const resistances = rows.filter((row) => row.covered.length > 0);
  // слабость, которую никто в составе не прикрывает - главная опасность пати
  const exposed = weaknesses.filter((row) => row.covered.length === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Team coverage"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-2 border-ink bg-paper p-5 outline-none sm:p-8 sm:shadow-[8px_8px_0_0_#16130d]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink pb-5">
          <div>
            <h2 className="font-display text-3xl uppercase">Team</h2>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-mut">
              Defensive coverage · {team.length} personas
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper"
            aria-label="Close"
          >
            ✕
          </button>
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

        {exposed.length > 0 && (
          <div className="mt-8 border-2 border-blood bg-blood/10 p-4">
            <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-blood">
              Exposed · weak with no cover
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
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Weaknesses
            </h3>
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
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Resistances
            </h3>
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
      </div>
    </div>
  );
}
