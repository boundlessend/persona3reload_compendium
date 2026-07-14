import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Persona } from "./api";
import { decodeQuery } from "./constants";

// хвостовой слэш опционален: хосты часто редиректят /persona/x -> /persona/x/
const PERSONA_PATH = /^\/persona\/(.+?)\/?$/;

// плавный переход открытия/закрытия модалки через View Transitions API (кросс-фейд
// между сеткой и модалкой). flushSync нужен, чтобы браузер снял «новое» состояние
// синхронно. без поддержки (Firefox) или при reduced-motion - применяем мгновенно
function runViewTransition(apply: () => void): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = (
    document as Document & {
      startViewTransition?: (callback: () => void) => void;
    }
  ).startViewTransition;
  if (!start || reduced) {
    apply();
    return;
  }
  start.call(document, () => flushSync(apply));
}

// роутинг через History API: deep-link /persona/<query>, popstate, синхронизация
// document.title и определение неизвестного пути (soft-404)
export function usePersonaRouting(personas: Persona[]): {
  selected: Persona | null;
  notFound: boolean;
  openPersona: (persona: Persona) => void;
  closePersona: () => void;
} {
  const [selected, setSelected] = useState<Persona | null>(null);
  const [notFound, setNotFound] = useState(false);
  // did WE push a /persona/... entry? drives whether close pops or replaces
  const historyPushedRef = useRef(false);
  // latest personas for the popstate listener, so it subscribes once
  const personasRef = useRef(personas);
  personasRef.current = personas;

  // после загрузки данных разобрать текущий путь: открыть персону или отметить 404
  useEffect(() => {
    if (!personas.length) return;
    const match = window.location.pathname.match(PERSONA_PATH);
    if (!match) {
      // всё, кроме "/" и /persona/..., - неизвестный путь
      setNotFound(window.location.pathname !== "/");
      return;
    }
    const query = decodeQuery(match[1] ?? "");
    const persona = query
      ? personas.find((item) => item.query === query)
      : undefined;
    if (persona) setSelected(persona);
    else setNotFound(true);
  }, [personas]);

  useEffect(() => {
    const onPop = () => {
      historyPushedRef.current = false;
      const match = window.location.pathname.match(PERSONA_PATH);
      const query = match ? decodeQuery(match[1] ?? "") : null;
      const persona = query
        ? personasRef.current.find((item) => item.query === query)
        : undefined;
      setSelected(persona ?? null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.title = selected
      ? `${selected.name} · Persona Compendium`
      : "Persona Compendium · Persona 3 Reload";
  }, [selected]);

  const openPersona = useCallback((persona: Persona) => {
    runViewTransition(() => setSelected(persona));
    // хвостовой слэш: так URL совпадает с prerender-файлом, который Render
    // отдаёт по /persona/<query>/ (см. scripts/prerender-meta.mjs)
    window.history.pushState(
      null,
      "",
      `/persona/${encodeURIComponent(persona.query)}/`,
    );
    historyPushedRef.current = true;
  }, []);

  const closePersona = useCallback(() => {
    runViewTransition(() => setSelected(null));
    // pop our own entry so Back does not re-open the modal; on a direct deep
    // link (no entry of ours) replace it instead, to avoid leaving the site
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    } else if (window.location.pathname !== "/") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  return { selected, notFound, openPersona, closePersona };
}
