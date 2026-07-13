import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/archivo/400.css";
import "@fontsource/archivo-black/400.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("root element #root not found");
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// офлайн-кэш только в проде: в dev SW мешал бы горячей перезагрузке Vite
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // регистрация не критична: сайт работает и без офлайна
    });
  });
}
