import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

// текущая тема: явный выбор из localStorage, иначе - системная prefers-color-scheme
function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

// переключатель темы с персистом; класс theme-dark/theme-light на <html> задаёт
// палитру (см. index.css). До рендера тему ставит /theme-init.js (анти-FOUC)
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-dark", theme === "dark");
    root.classList.toggle("theme-light", theme === "light");
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0c0e0a" : "#eae4d6");
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // storage недоступен (private mode/quota): тема останется только на сессию
    }
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
    [],
  );

  return { theme, toggleTheme };
}
