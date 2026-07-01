import { useEffect, useRef, type RefObject } from "react";

// shared dialog behaviour: scroll lock, initial focus, focus restore on close,
// Escape, and a Tab focus trap (disabled while trapActive is false)
export function useDialog(
  ref: RefObject<HTMLDivElement | null>,
  onEscape: () => void,
  trapActive: boolean,
) {
  // hold the latest onEscape so the key listener is not re-bound every render
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.body.style.overflow = "";
      previouslyFocused?.focus();
    };
  }, [ref]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        escapeRef.current();
        return;
      }
      if (event.key !== "Tab" || !trapActive) return;
      const focusable = ref.current?.querySelectorAll<HTMLElement>(
        'a[href], button, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
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
