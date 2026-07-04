import { useCallback, useEffect, useRef, useState } from "react";
import type { Persona } from "./api";
import { decodeQuery } from "./constants";

const PERSONA_PATH = /^\/persona\/(.+)$/;

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
        ? personas.find((item) => item.query === query)
        : undefined;
      setSelected(persona ?? null);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [personas]);

  useEffect(() => {
    document.title = selected
      ? `${selected.name} · Persona Compendium`
      : "Persona Compendium · Persona 3 Reload";
  }, [selected]);

  const openPersona = useCallback((persona: Persona) => {
    setSelected(persona);
    window.history.pushState(
      null,
      "",
      `/persona/${encodeURIComponent(persona.query)}`,
    );
    historyPushedRef.current = true;
  }, []);

  const closePersona = useCallback(() => {
    setSelected(null);
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
