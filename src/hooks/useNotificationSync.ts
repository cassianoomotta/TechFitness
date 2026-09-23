"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSupabaseClient } from "@/lib/supabase-client";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface UseNotificationSyncOptions {
  userId?: string;
  enabled?: boolean;
}

export function useNotificationSync({ userId, enabled = true }: UseNotificationSyncOptions = {}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const isRealtimeConnected = useRef<boolean>(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data: NotificationItem[] = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      }
    } catch (err) {
      console.error("Erro ao sincronizar notificações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Atualização otimista imediata na UI
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/notifications", { method: "PUT" });
    } catch (err) {
      console.error("Erro ao marcar notificações como lidas no servidor:", err);
      // Reverter se falhou
      fetchNotifications();
    }
  }, [fetchNotifications]);

  // 1. Carga inicial
  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();
  }, [enabled, fetchNotifications]);

  // 2. Conexão WebSocket via Supabase Realtime (se userId fornecido)
  useEffect(() => {
    if (!enabled || !userId) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channelName = `realtime-notifications-${userId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;
          if (newNotification && newNotification.userId === userId) {
            setNotifications((prev) => [newNotification, ...prev]);
            if (!newNotification.read) {
              setUnreadCount((count) => count + 1);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Notification",
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as NotificationItem;
          if (updatedNotification) {
            setNotifications((prev) =>
              prev.map((item) =>
                item.id === updatedNotification.id ? updatedNotification : item
              )
            );
            // Recalcular não lidas
            setNotifications((current) => {
              setUnreadCount(current.filter((n) => !n.read).length);
              return current;
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isRealtimeConnected.current = true;
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          isRealtimeConnected.current = false;
        }
      });

    return () => {
      isRealtimeConnected.current = false;
      supabase.removeChannel(channel);
    };
  }, [enabled, userId]);

  // 3. Sincronização inteligente por Visibilidade / Foco da Janela
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityOrFocus = () => {
      // Quando o usuário volta à aba do navegador, sincroniza os dados
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchNotifications();
      }
    };

    const handleCustomRefresh = () => {
      fetchNotifications();
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    window.addEventListener("techfitness:refresh-notifications", handleCustomRefresh);

    // Heartbeat de segurança suave (apenas a cada 120s e se a aba estiver visível)
    const fallbackInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchNotifications();
      }
    }, 120000);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.removeEventListener("techfitness:refresh-notifications", handleCustomRefresh);
      clearInterval(fallbackInterval);
    };
  }, [enabled, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refresh: fetchNotifications,
    markAllAsRead,
  };
}

/**
 * Utilitário global para disparar sincronização instantânea de notificações em qualquer lugar da aplicação
 */
export function triggerNotificationRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("techfitness:refresh-notifications"));
  }
}
