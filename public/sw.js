// TechFitness Service Worker - PWA e Gerenciamento de Cache
const SW_VERSION = "techfitness-sw-v3";

// Chave global para notificações nativas de sistema (desativada para celulares)
const ENABLE_SYSTEM_NOTIFICATIONS = false;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Fechar e limpar qualquer notificação nativa residual pendente no sistema do dispositivo móvel
      (async () => {
        try {
          if (self.registration && typeof self.registration.getNotifications === "function") {
            const notifications = await self.registration.getNotifications();
            notifications.forEach((notification) => {
              try {
                notification.close();
              } catch (_) {}
            });
          }
        } catch (_) {}
      })(),
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
  if (!ENABLE_SYSTEM_NOTIFICATIONS || !event.data) return;

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
    if (activeResolve) {
      activeResolve();
      activeResolve = null;
    }

    const durationSeconds = Math.max(1, Number(seconds));
    const targetTimestamp = Date.now() + durationSeconds * 1000;
    restTimerTargetTimestamp = targetTimestamp;

    event.waitUntil(
      new Promise((resolve) => {
        activeResolve = resolve;

        restTimerTimeoutId = setTimeout(async () => {
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
  if (!ENABLE_SYSTEM_NOTIFICATIONS) return;
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
