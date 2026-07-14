import { useEffect, useRef, useState } from "react";

// регистрирует service worker (только PROD) и следит за обновлениями. когда новый
// worker установлен и ждёт (waiting), возвращает updateReady - страница показывает
// prompt. applyUpdate шлёт SKIP_WAITING; активация нового worker'а роняет
// controllerchange, по которому перезагружаемся - но только если апдейт инициировали
// мы (первый визит тоже даёт controllerchange из-за clients.claim, его игнорируем)
export function useServiceWorker(): {
  updateReady: boolean;
  applyUpdate: () => void;
} {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const initiatedRef = useRef(false);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = (): void => {
      if (!initiatedRef.current || refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    // worker считается обновлением (а не первой установкой) только если уже есть
    // активный контроллер - иначе первый визит ложно показал бы prompt
    const markWaiting = (worker: ServiceWorker): void => {
      if (navigator.serviceWorker.controller) setWaiting(worker);
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (registration.waiting) markWaiting(registration.waiting);
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed") markWaiting(installing);
          });
        });
      })
      .catch(() => {
        // регистрация не критична: сайт работает и без офлайна
      });

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    };
  }, []);

  const applyUpdate = (): void => {
    initiatedRef.current = true;
    waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  return { updateReady: waiting !== null, applyUpdate };
}
