// Utilitário para gerenciamento do Service Worker do TechFitness
// Notificações de sistema operacional mantidas com chave de desativação global (ENABLE_SYSTEM_NOTIFICATIONS)

/**
 * Chave de controle global para notificações de sistema operacional no celular.
 * Mantida desativada (false) por padrão para evitar instabilidades e bugs em navegadores móveis.
 * Altere para true caso deseje reativar notificações de sistema nativas no futuro.
 */
export const ENABLE_SYSTEM_NOTIFICATIONS = false;

/**
 * Registra o Service Worker oficial do TechFitness se suportado pelo navegador
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    // Forçar verificação de atualização do arquivo sw.js no servidor
    registration.update().catch(() => {});
    return registration;
  } catch (error) {
    console.warn("Aviso ao registrar Service Worker do TechFitness:", error);
    return null;
  }
}

/**
 * Solicita permissão nativa de notificações ao usuário (desativado quando ENABLE_SYSTEM_NOTIFICATIONS = false)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!ENABLE_SYSTEM_NOTIFICATIONS) {
    return "denied";
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return Notification.permission;
  }
}

/**
 * Agenda a notificação de término de descanso no Service Worker em segundo plano
 */
export async function scheduleRestNotification(
  seconds: number,
  title: string = "TechFitness — Hora do Show! 🏋️‍♂️",
  body: string = "Tempo de descanso encerrado! Bora para a próxima série!",
  url: string = "/student/workout-session"
): Promise<boolean> {
  if (!ENABLE_SYSTEM_NOTIFICATIONS) {
    return false;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({
        type: "SCHEDULE_REST_TIMER",
        seconds,
        title,
        body,
        url,
      });
      return true;
    }
  } catch (err) {
    console.warn("Erro ao agendar notificação no Service Worker:", err);
  }
  return false;
}

/**
 * Cancela a notificação de descanso agendada
 */
export async function cancelRestNotification(): Promise<boolean> {
  if (!ENABLE_SYSTEM_NOTIFICATIONS) {
    return false;
  }

  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage({
        type: "CANCEL_REST_TIMER",
      });
      return true;
    }
  } catch (err) {
    console.warn("Erro ao cancelar notificação no Service Worker:", err);
  }
  return false;
}

export interface ExtendedNotificationOptions extends NotificationOptions {
  vibrate?: number[];
  renotify?: boolean;
}

/**
 * Dispara uma notificação nativa imediata via Service Worker Registration
 */
export async function showNativeNotification(
  title: string = "TechFitness — Hora do Show! 🏋️‍♂️",
  options?: ExtendedNotificationOptions
): Promise<boolean> {
  if (!ENABLE_SYSTEM_NOTIFICATIONS) {
    return false;
  }

  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && typeof registration.showNotification === "function") {
        const swOptions: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
          icon: "/logo.png",
          badge: "/logo.png",
          vibrate: [350, 120, 1000],
          tag: "techfitness-rest-timer",
          renotify: false,
          requireInteraction: false,
          ...options,
        };
        await registration.showNotification(title, swOptions as NotificationOptions);
        return true;
      }
    }

    new Notification(title, {
      icon: "/logo.png",
      badge: "/logo.png",
      ...options,
    });
    return true;
  } catch (err) {
    console.warn("Erro ao emitir notificação nativa:", err);
    return false;
  }
}
