import { useState, useEffect, useCallback, useRef } from 'react';
import type { NotificationItem } from '@kidscare/shared-types';
import { getNotifications, markNotificationAsRead } from '../../api/notifications';
import { useAuth } from '../../features/auth/AuthContext';

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
  const { state } = useAuth();
  const isAuthenticated = state.status === 'authenticated';

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Takip edilen bildirim ID'leri (yeni gelenleri Web Notification ile bildirmek için)
  const knownIdsRef = useRef<Set<string>>(new Set());
  const initialFetchDone = useRef(false);

  const fetchList = useCallback(
    async (isBackground = false) => {
      if (!isAuthenticated) return;
      if (!isBackground) setLoading(true);
      try {
        const data = await getNotifications(50);
        setNotifications(data);
        setError(null);

        // Tarayıcı masaüstü bildirimi (ilk açılıştan sonra gelen yeni bildirimler için)
        if (initialFetchDone.current && typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            for (const item of data) {
              if (!knownIdsRef.current.has(item.id) && !item.isRead) {
                try {
                  new Notification(item.title, {
                    body: item.body,
                    icon: '/favicon.ico',
                  });
                } catch {
                  // Tarayıcı kısıtlamalarını sessizce yut
                }
              }
            }
          }
        }

        // ID'leri kaydet
        data.forEach((item) => knownIdsRef.current.add(item.id));
        initialFetchDone.current = true;
      } catch (err: unknown) {
        if (!isBackground) {
          setError(err instanceof Error ? err.message : 'Bildirimler alınamadı');
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    },
    [isAuthenticated],
  );

  // İlk yükleme ve periyodik polling
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      knownIdsRef.current.clear();
      initialFetchDone.current = false;
      return;
    }

    void fetchList(false);

    const interval = setInterval(() => {
      void fetchList(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchList]);

  const markAsRead = useCallback(
    async (id: string) => {
      // İyimser güncelleme (Optimistic UI)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      try {
        await markNotificationAsRead(id);
      } catch {
        // Hata durumunda listeyi tekrar senkronize et
        void fetchList(true);
      }
    },
    [fetchList],
  );

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await Promise.all(unread.map((n) => markNotificationAsRead(n.id)));
    } catch {
      void fetchList(true);
    }
  }, [notifications, fetchList]);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return null;
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return null;
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchList,
    markAsRead,
    markAllAsRead,
    requestPermission,
  };
}
