// применяет явно выбранную тему до первого рендера, чтобы не было вспышки света.
// внешний файл (не inline) - проходит строгий CSP script-src 'self'.
// нет явного выбора -> тему решает CSS @media (prefers-color-scheme) в index.css
(function () {
  try {
    var t = localStorage.getItem("theme");
    if (t !== "light" && t !== "dark") return;
    document.documentElement.classList.add(
      t === "dark" ? "theme-dark" : "theme-light",
    );
  } catch (e) {}
})();
