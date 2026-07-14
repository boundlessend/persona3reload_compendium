import { useEffect, useRef, type RefObject } from "react";

// общий стек открытых диалогов: блокировку скролла ref-count'им (снимаем, только
// когда закрылся последний), а Escape/Tab-ловушку и активность отдаём лишь
// верхнему диалогу - нижние помечаем inert (уходят из Tab-порядка и из скринридера)
type DialogEntry = { ref: RefObject<HTMLDivElement | null> };

const stack: DialogEntry[] = [];

// верхний диалог активен, все, что под ним, - inert
function refreshInert(): void {
  stack.forEach((entry, index) => {
    const panel = entry.ref.current;
    if (!panel) return;
    if (index === stack.length - 1) panel.removeAttribute("inert");
    else panel.setAttribute("inert", "");
  });
}

export function useDialog(
  ref: RefObject<HTMLDivElement | null>,
  onEscape: () => void,
  trapActive: boolean,
) {
  // держим свежий onEscape, чтобы не перевешивать слушатель на каждый рендер
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    const entry: DialogEntry = { ref };
    const previouslyFocused = document.activeElement as HTMLElement | null;
    stack.push(entry);
    if (stack.length === 1) document.body.style.overflow = "hidden";
    refreshInert();
    ref.current?.focus();
    return () => {
      const index = stack.indexOf(entry);
      if (index !== -1) stack.splice(index, 1);
      if (stack.length === 0) document.body.style.overflow = "";
      refreshInert();
      previouslyFocused?.focus();
    };
  }, [ref]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // на клавиши реагирует только верхний диалог стека
      if (stack[stack.length - 1]?.ref !== ref) return;
      if (event.key === "Escape") {
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab" || !trapActive) return;
      const focusable = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable]:not([contenteditable="false"]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ref, trapActive]);
}
