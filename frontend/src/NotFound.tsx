import { useEffect } from "react";

// 404 в эстетике "Тёмного часа" из Persona 3: экран уходит в тень, а страницу
// забрал Жнец (секретный враг, что приходит к медлящим в Тартаре)
export function NotFound() {
  // хостинг отдаёт SPA-фолбэк с кодом 200 на любой путь (soft-404); просим
  // краулеров не индексировать несуществующие страницы
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 text-center text-paper">
      <p className="font-display text-[clamp(5rem,25vw,12rem)] uppercase leading-none tracking-tight text-blood">
        404
      </p>
      <h1 className="mt-4 font-display text-2xl uppercase tracking-tight sm:text-4xl">
        Lost to the Dark Hour
      </h1>
      <div className="my-6 h-0.5 w-24 bg-blood" />
      <p className="max-w-md font-mono text-sm uppercase tracking-wider text-paper/70">
        The Reaper reached this page before you did.
      </p>
      <a
        href="/"
        className="mt-10 inline-block bg-blood px-8 py-4 font-mono text-sm uppercase tracking-widest text-paper transition hover:bg-paper hover:text-ink"
      >
        Return to the record →
      </a>
    </div>
  );
}
