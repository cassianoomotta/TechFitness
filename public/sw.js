// TechFitness Service Worker - Notificações Oficiais de Sistema e Temporizador de Descanso
const SW_VERSION = "techfitness-sw-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

let restTimerTimeoutId = null;

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

    if (restTimerTimeoutId) {
      clearTimeout(restTimerTimeoutId);
      restTimerTimeoutId = null;
    }

    const delayMs = Math.max(1, Number(seconds)) * 1000;

    // event.waitUntil mantém o Service Worker ativo pelo tempo de contagem
    event.waitUntil(
      new Promise((resolve) => {
        restTimerTimeoutId = setTimeout(async () => {
          try {
            await self.registration.showNotification(title, {
              body,
              icon: "/logo.png",
              badge: "/logo.png",
              vibrate: [350, 120, 1000],
              tag: "techfitness-rest-timer",
              renotify: false,
              requireInteraction: false,
              data: { url },
            });
          } catch (err) {
            console.error("Erro ao disparar notificação via Service Worker:", err);
          } finally {
            restTimerTimeoutId = null;
            resolve();
          }
        }, delayMs);
      })
    );
  } else if (type === "CANCEL_REST_TIMER") {
    if (restTimerTimeoutId) {
      clearTimeout(restTimerTimeoutId);
      restTimerTimeoutId = null;
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
        icon: "/logo.png",
        badge: "/logo.png",
        vibrate: [350, 120, 1000],
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
