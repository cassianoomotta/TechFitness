// TechFitness Service Worker - Notificações Oficiais de Sistema e Temporizador de Descanso
const SW_VERSION = "techfitness-sw-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== SW_VERSION).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

let restTimerTimeoutId = null;
let restTimerTargetTimestamp = 0;
let activeResolve = null;

self.addEventListener("message", (event) => {
  if (!event.data) return;

  const { type } = event.data;

  if (type === "SCHEDULE_REST_TIMER") {
    const {
      seconds = 60,
      title = "TechFitness — Hora do Show! 🏋️‍♂️",
      body = "Tempo de descanso encerrado! Bora para a próxima série!",
      url = "/student/workout-session",
    } = event.data;

    // Cancela imediatamente qualquer agendamento pendente anterior
    if (restTimerTimeoutId) {
      clearTimeout(restTimerTimeoutId);
      restTimerTimeoutId = null;
    }
    if (activeResolve) {
      activeResolve();
      activeResolve = null;
    }

    const durationSeconds = Math.max(1, Number(seconds));
    const targetTimestamp = Date.now() + durationSeconds * 1000;
    restTimerTargetTimestamp = targetTimestamp;

    // Mantém o Service Worker ativo pelo tempo necessário do temporizador
    event.waitUntil(
      new Promise((resolve) => {
        activeResolve = resolve;

        restTimerTimeoutId = setTimeout(async () => {
          // Se o temporizador foi cancelado ou substituído, aborta a notificação
          if (restTimerTargetTimestamp !== targetTimestamp) {
            resolve();
            return;
          }

          try {
            await self.registration.showNotification(title, {
              body,
              icon: "/icons/icon-192.png",
              badge: "/icons/icon-192.png",
              vibrate: [400, 150, 400, 150, 800],
              tag: "techfitness-rest-timer",
              renotify: false,
              requireInteraction: false,
              data: { url },
            });
          } catch (err) {
            console.error("Erro ao disparar notificação via Service Worker:", err);
          } finally {
            restTimerTimeoutId = null;
            restTimerTargetTimestamp = 0;
            activeResolve = null;
            resolve();
          }
        }, durationSeconds * 1000);
      })
    );
  } else if (type === "CANCEL_REST_TIMER") {
    if (restTimerTimeoutId) {
      clearTimeout(restTimerTimeoutId);
      restTimerTimeoutId = null;
    }
    restTimerTargetTimestamp = 0;
    if (activeResolve) {
      activeResolve();
      activeResolve = null;
    }
  } else if (type === "TRIGGER_NOTIFICATION_NOW") {
    const {
      title = "TechFitness — Hora do Show! 🏋️‍♂️",
      body = "Tempo de descanso encerrado! Bora para a próxima série!",
      url = "/student/workout-session",
    } = event.data;

    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        vibrate: [400, 150, 400, 150, 800],
        tag: "techfitness-rest-timer",
        renotify: false,
        requireInteraction: false,
        data: { url },
      })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/student/workout-session";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client && typeof client.focus === "function") {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
