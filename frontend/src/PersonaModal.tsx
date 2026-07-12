import { useEffect, useMemo, useRef, useState } from "react";
import type { Persona } from "./api";
import { idTag } from "./constants";
import { PersonaImage } from "./PersonaImage";
import { AffinityList, StatList } from "./PersonaDetails";
import { useDialog } from "./useDialog";
import { reverseRecipes, SPECIAL_RECIPES } from "./fusion";

export function PersonaModal({
  persona,
  personas,
  onClose,
  isFavorite,
  onToggleFavorite,
}: {
  persona: Persona;
  personas: Persona[];
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (query: string) => void;
}) {
  const special = SPECIAL_RECIPES[persona.query];
  const reverse = useMemo(
    () =>
      special || persona.dlc === 1
        ? { recipes: [], total: 0 }
        : reverseRecipes(persona, personas, 8),
    [persona, personas, special],
  );
  const [zoom, setZoom] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const enlargeRef = useRef<HTMLButtonElement>(null);
  const zoomCloseRef = useRef<HTMLButtonElement>(null);

  const closeZoom = () => {
    setZoom(false);
    enlargeRef.current?.focus();
  };

  // Escape closes the zoom first, then the modal; Tab trap pauses during zoom
  useDialog(panelRef, () => (zoom ? closeZoom() : onClose()), !zoom);

  // move focus into the zoom overlay when it opens
  useEffect(() => {
    if (zoom) zoomCloseRef.current?.focus();
  }, [zoom]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={persona.name}
        aria-hidden={zoom || undefined}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto border-2 border-ink bg-paper p-8 outline-none sm:shadow-[8px_8px_0_0_#16130d]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b-2 border-ink pb-6 sm:gap-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <button
              type="button"
              ref={enlargeRef}
              onClick={() => setZoom(true)}
              className="group relative grid h-28 w-28 shrink-0 place-items-center border-2 border-ink bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
              aria-label="Enlarge artwork"
            >
              <PersonaImage
                persona={persona}
                className="h-24 object-contain mix-blend-multiply"
              />
              <span className="absolute bottom-1 right-1 bg-ink px-1.5 py-0.5 font-mono text-[10px] uppercase text-paper opacity-0 transition group-hover:opacity-100">
                Zoom
              </span>
            </button>
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-wider text-blood">
                {idTag(persona.id)} · {persona.arcana} · Lv {persona.level} ·{" "}
                {persona.origin}
              </p>
              <h2 className="mt-1 font-display text-4xl uppercase leading-none break-words sm:text-5xl">
                {persona.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(persona.query)}
              aria-pressed={isFavorite}
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
              className={`grid h-9 w-9 place-items-center border-2 text-lg leading-none transition ${
                isFavorite
                  ? "border-blood bg-blood text-paper"
                  : "border-ink text-ink hover:bg-ink hover:text-paper"
              }`}
            >
              {isFavorite ? "★" : "☆"}
            </button>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        <p className="mt-6 leading-relaxed text-mut">{persona.description}</p>

        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Stats
            </h3>
            <div className="mt-4">
              <StatList persona={persona} />
            </div>
          </div>
          <div>
            <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
              Affinities
            </h3>
            <div className="mt-4">
              <AffinityList persona={persona} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="border-b-2 border-ink pb-2 font-mono text-xs font-bold uppercase tracking-widest text-blood">
            Fusion recipes
          </h3>
          <div className="mt-4">
            {special ? (
              <p className="font-mono text-sm text-ink">
                Special: {special.join(" × ")}
              </p>
            ) : persona.dlc === 1 ? (
              <p className="font-mono text-sm text-mut">
                DLC persona - obtained via DLC, not by fusion.
              </p>
            ) : reverse.recipes.length ? (
              <>
                <ul className="space-y-1 font-mono text-sm text-ink">
                  {reverse.recipes.map(({ a, b }) => (
                    <li key={`${a.id}-${b.id}`}>
                      {a.name} + {b.name}
                    </li>
                  ))}
                </ul>
                {reverse.total > reverse.recipes.length && (
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-mut">
                    +{reverse.total - reverse.recipes.length} more recipes
                  </p>
                )}
              </>
            ) : (
              <p className="font-mono text-sm text-mut">
                No normal fusion recipe.
              </p>
            )}
          </div>
        </div>
      </div>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${persona.name} artwork`}
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          onClick={(event) => {
            event.stopPropagation();
            closeZoom();
          }}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              zoomCloseRef.current?.focus();
            }
          }}
        >
          <PersonaImage
            persona={persona}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          <button
            ref={zoomCloseRef}
            onClick={(event) => {
              event.stopPropagation();
              closeZoom();
            }}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center border-2 border-paper text-paper transition hover:bg-paper hover:text-ink"
            aria-label="Close artwork"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
