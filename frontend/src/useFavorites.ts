import { useCallback, useEffect, useState } from "react";

// избранные персоны с персистом в localStorage; при недоступности storage
// (private mode/quota) деградирует до in-memory
export function useFavorites(): {
  favorites: Set<string>;
  toggleFavorite: (query: string) => void;
} {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("favorites");
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
      localStorage.setItem("favorites", JSON.stringify([...favorites]));
    } catch {
      // storage недоступен (private mode/quota): остаёмся только в памяти
    }
  }, [favorites]);

  const toggleFavorite = useCallback((query: string): void => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(query)) next.delete(query);
      else next.add(query);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
