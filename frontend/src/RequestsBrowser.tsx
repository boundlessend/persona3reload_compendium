import { useMemo, useState } from "react";
import { useRequests } from "./useRequests";
import type { RequestType } from "./useRequests";
import { ErrorNote } from "./ErrorNote";
import { Chip } from "./Controls";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

const TYPES: { key: RequestType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "item", label: "Item" },
  { key: "money", label: "Money" },
  { key: "skill-card", label: "Skill card" },
  { key: "key-unlock", label: "Key unlock" },
];

// тон бейджа награды по типу; skill-card/key-unlock подсвечиваем
const TYPE_TONE: Record<RequestType, string> = {
  item: "border border-ink/40 text-mut",
  money: "border border-ink/40 text-mut",
  "skill-card": "bg-ink text-paper",
  "key-unlock": "bg-blood text-paper",
};

const numTag = (n: number): string => `№${String(n).padStart(3, "0")}`;

// страница /requests/: 101 запрос Элизабет P3R (задача -> награда), с фильтром по
// типу награды и тумблером «только missable». данные курированы из гайдов
export function RequestsBrowser() {
  const { requests, loading, error } = useRequests();
  const [type, setType] = useState<RequestType | "all">("all");
  const [missableOnly, setMissableOnly] = useState(false);

  const visible = useMemo(
    () =>
      requests.filter(
        (request) =>
          (type === "all" || request.type === type) &&
          (!missableOnly || request.missable || request.deadline),
      ),
    [requests, type, missableOnly],
  );

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="font-mono text-sm tracking-[0.1em] text-blood">
          THE VELVET ROOM
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,12vw,4rem)] uppercase leading-none tracking-tight">
          Elizabeth's Requests
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-mut">
          All 101 requests from Elizabeth in Persona 3 Reload, with their reward.
          Requests with a deadline are date-gated; №044 is genuinely missable
          (a one-time event). Compiled from community guides - a few reward item
          names are lower-confidence, so verify in-game.
        </p>

        {error ? (
          <ErrorNote message={`Could not load requests: ${error}.`} />
        ) : loading ? (
          <p className="mt-12 font-mono text-xs uppercase tracking-wider text-mut">
            Loading…
          </p>
        ) : (
          <>
            <div className="mt-10 flex flex-wrap items-center gap-2">
              {TYPES.map(({ key, label }) => (
                <Chip
                  key={key}
                  pressed={type === key}
                  onClick={() => setType(key)}
                  className="px-3 text-xs"
                >
                  {label}
                </Chip>
              ))}
              {/* ponytail: сырая кнопка, а не Chip - у неё blood-акцент при нажатии
                  (в тон deadline/missable-бейджам ниже), которого Chip не даёт */}
              <button
                type="button"
                onClick={() => setMissableOnly((on) => !on)}
                aria-pressed={missableOnly}
                className={`ml-auto border-2 border-ink px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood ${
                  missableOnly ? "bg-blood text-paper" : "hover:bg-ink hover:text-paper"
                }`}
              >
                Deadline / missable
              </button>
            </div>

            <p className="mt-8 font-mono text-xs uppercase tracking-wider text-mut">
              {visible.length} of {requests.length} requests
            </p>
            <ul className="mt-4 border-t-2 border-ink">
              {visible.map((request) => (
                <li
                  key={request.n}
                  className="flex flex-col gap-1 border-b-2 border-ink py-3 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <span className="shrink-0 font-mono text-[11px] uppercase tracking-wider text-blood">
                    {numTag(request.n)}
                  </span>
                  <span className="flex-1 leading-snug text-ink">
                    {request.task}
                  </span>
                  <span className="flex shrink-0 flex-wrap items-center gap-2">
                    <span className="font-mono text-xs uppercase tracking-wider text-mut">
                      {request.reward}
                    </span>
                    <span
                      className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${TYPE_TONE[request.type]}`}
                    >
                      {request.type}
                    </span>
                    {request.deadline && (
                      <span className="border border-blood px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-blood">
                        by {request.deadline}
                      </span>
                    )}
                    {request.missable && (
                      <span className="bg-blood px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-paper">
                        missable
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
