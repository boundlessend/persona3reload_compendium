import { useRef } from "react";
import type { Persona } from "./api";
import { PersonaImage } from "./PersonaImage";
import { AffinityList, StatList } from "./PersonaDetails";
import { useDialog } from "./useDialog";

export function CompareModal({
  a,
  b,
  onClose,
}: {
  a: Persona;
  b: Persona;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialog(panelRef, onClose, true);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Compare personas"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto border-2 border-ink bg-paper p-5 outline-none sm:p-8 sm:shadow-[8px_8px_0_0_#16130d]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-ink pb-5">
          <h2 className="font-display text-3xl uppercase">Compare</h2>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6">
          {[a, b].map((persona) => (
            <div key={persona.id} className="space-y-4">
              <div className="text-center">
                <PersonaImage
                  persona={persona}
                  className="mx-auto h-24 object-contain mix-blend-multiply"
                />
                <p className="mt-2 font-display text-xl uppercase leading-none sm:text-2xl">
                  {persona.name}
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-blood">
                  {persona.arcana} · Lv {persona.level}
                </p>
              </div>
              <StatList persona={persona} />
              <AffinityList persona={persona} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
