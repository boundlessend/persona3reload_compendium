import { usePersistedSet } from "./usePersistedSet";

// отмеченные как «собрана/зарегистрирована в компендиуме» персоны (трекер
// прохождения) с персистом в localStorage (см. usePersistedSet)
export function useRegistered(): {
  registered: Set<string>;
  toggleRegistered: (query: string) => void;
} {
  const { set, toggle } = usePersistedSet("registered");
  return { registered: set, toggleRegistered: toggle };
}
