import { useCallback, useEffect, useState } from "react";

// множество строковых id с персистом в localStorage под ключом key; при
// недоступности storage (private mode/quota) деградирует до in-memory.
// общая база для useFavorites и useRegistered
export function usePersistedSet(key: string): {
  set: Set<string>;
  toggle: (id: string) => void;
} {
  const [set, setSet] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return new Set(
        Array.isArray(parsed)
          ? parsed.filter((item): item is string => typeof item === "string")
          : [],
      );
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      // storage недоступен (private mode/quota): остаёмся только в памяти
    }
  }, [key, set]);

  const toggle = useCallback((id: string): void => {
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { set, toggle };
}
