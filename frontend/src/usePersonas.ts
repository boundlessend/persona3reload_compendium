import { parsePersonas, type Persona } from "./api";
import { useJsonResource } from "./useJsonResource";

// загрузка статического справочника персон; общий хук для всех страниц
export function usePersonas(): {
  personas: Persona[];
  loading: boolean;
  error: string | null;
} {
  const { data, loading, error } = useJsonResource<Persona[]>(
    "/personas.json",
    [],
    parsePersonas,
  );
  return { personas: data, loading, error };
}
