export function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2 sm:gap-3">
          <span className="font-display text-lg uppercase tracking-tight sm:text-2xl">
            Compendium
          </span>
          <span className="border border-blood px-1.5 py-0.5 font-mono text-[11px] tracking-widest text-blood">
            P3R
          </span>
        </a>
        <div className="flex items-center gap-4 sm:gap-5 md:gap-7">
          <a
            href="#browse"
            className="hidden font-mono text-xs uppercase tracking-wider text-ink transition hover:text-blood sm:inline-block"
          >
            Browse
          </a>
          <a
            href="https://github.com/boundlessend/persona3reload_compendium"
            className="bg-ink px-3 py-2 font-mono text-xs uppercase tracking-wider text-paper transition hover:bg-blood sm:px-5"
          >
            Source ↗
          </a>
        </div>
      </nav>
    </header>
  );
}
