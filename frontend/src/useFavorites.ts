import { usePersistedSet } from "./usePersistedSet";

// избранные персоны с персистом в localStorage (см. usePersistedSet)
export function useFavorites(): {
  favorites: Set<string>;
  toggleFavorite: (query: string) => void;
} {
  const { set, toggle } = usePersistedSet("favorites");
  return { favorites: set, toggleFavorite: toggle };
}
