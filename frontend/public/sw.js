// офлайн-кэш P3R-компендиума (рукопашный, без зависимостей). стратегии:
// - навигации (HTML): network-first, кэш маршрута, офлайн-фолбэк на shell "/"
// - данные (personas/skills.json): stale-while-revalidate
// - остальное same-origin (хешированные JS/CSS, картинки, шрифты): cache-first
// версию бампаем, чтобы сбросить старый кэш при несовместимом изменении стратегии
const CACHE = "p3r-v1";
const PRECACHE = [
  "/",
  "/theme-init.js",
  "/personas.json",
  "/skills.json",
  "/bosses.json",
  "/requests.json",
  "/site.webmanifest",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// данные со стабильным URL: отдаём из кэша, в фоне обновляем (stale-while-revalidate)
const SWR_PATHS = new Set([
  "/personas.json",
  "/skills.json",
  "/bosses.json",
  "/requests.json",
]);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
  // НЕ skipWaiting автоматически: новый worker остаётся waiting, пока страница не
  // спросит пользователя и не пришлёт SKIP_WAITING (иначе апдейт без спроса)
});

// страница подтвердила обновление -> активируемся немедленно (см. useServiceWorker)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

function cachePut(request, response) {
  if (response && response.ok) {
    const clone = response.clone();
    caches.open(CACHE).then((cache) => cache.put(request, clone));
  }
  return response;
}

// отдаём кэш сразу, в фоне обновляем из сети (для данных со стабильным URL)
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => cachePut(request, response))
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cachePut(request, response))
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/")),
        ),
    );
    return;
  }

  if (SWR_PATHS.has(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    caches
      .match(request)
      .then((cached) => cached || fetch(request).then((response) => cachePut(request, response))),
  );
});
