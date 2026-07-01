import type { Persona } from "./api";

// Inline placeholder for the handful of personas whose upstream art 404s.
function placeholderFor(name: string): string {
  const initial = name.slice(0, 1).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="#eae4d6"/>
    <text x="50%" y="56%" font-family="sans-serif" font-size="96" font-weight="800"
      font-style="italic" fill="#c8102e" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function PersonaImage({
  persona,
  className,
}: {
  persona: Persona;
  className: string;
}) {
  return (
    <img
      src={persona.image}
      alt={persona.name}
      loading="lazy"
      decoding="async"
      onError={(event) => {
        const img = event.currentTarget;
        img.onerror = null;
        img.src = placeholderFor(persona.name);
      }}
      className={className}
    />
  );
}
