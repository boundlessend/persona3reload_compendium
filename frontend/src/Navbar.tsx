import { useState } from "react";
import { useTheme } from "./useTheme";

const NAV_LINKS = [
  { href: "/#browse", label: "Browse" },
  { href: "/#stats", label: "Stats" },
  { href: "/arcana/", label: "Arcana" },
  { href: "/skills/", label: "Skills" },
  { href: "/bosses/", label: "Bosses" },
  { href: "/requests/", label: "Requests" },
];

const SOURCE_HREF = "https://github.com/boundlessend/persona3reload_compendium";

export function Navbar() {
  // на мобильном ссылки прячутся за бургер; на десктопе видны в строку
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-ink bg-paper">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/#top" className="flex items-center gap-2 sm:gap-3">
          <span className="font-display text-lg uppercase tracking-tight sm:text-2xl">
            Compendium
          </span>
          <span className="border border-blood px-1.5 py-0.5 font-mono text-[11px] tracking-widest text-blood">
            P3R
          </span>
        </a>

        <div className="flex items-center gap-4 sm:gap-5 md:gap-7">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hidden font-mono text-xs uppercase tracking-wider text-ink transition hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood sm:inline-block"
            >
              {link.label}
            </a>
          ))}
          <a
            href={SOURCE_HREF}
            rel="noopener noreferrer"
            className="hidden bg-ink px-3 py-2 font-mono text-xs uppercase tracking-wider text-paper transition hover:bg-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood sm:inline-block sm:px-5"
          >
            Source ↗
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            className="grid h-10 w-10 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
          >
            <span aria-hidden="true" className="text-base leading-none">
              {theme === "dark" ? "☀" : "☾"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="grid h-10 w-10 place-items-center border-2 border-ink text-ink transition hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood sm:hidden"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              {open ? "✕" : "≡"}
            </span>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-nav" className="border-t-2 border-ink bg-paper sm:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ink/15 py-3.5 font-mono text-sm uppercase tracking-wider text-ink transition hover:text-blood focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
              >
                {link.label}
              </a>
            ))}
            <a
              href={SOURCE_HREF}
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-3.5 font-mono text-sm uppercase tracking-wider text-blood transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-blood"
            >
              Source ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
