import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { MunicipalNotification } from '../types';
import { notificationService } from '../services/notificationService';

interface NotificationContextValue {
  /** Full list of notifications (newest first) — single source of truth for bell + center page */
  notifications: MunicipalNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  refreshNotifications: () => Promise<void>;
  /** Marks the notification as read. Navigation to the relevant page is handled by the UI layer. */
  openNotification: (id: string) => void;
  /** Most recent notification delivered by the real-time stream (for subtle toasts). */
  lastIncoming: MunicipalNotification | null;
  clearLastIncoming: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  /** Keyed by authenticated user so each municipal officer gets their own notification state. */
  userId?: string;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ userId, children }) => {
  const [notifications, setNotifications] = useState<MunicipalNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastIncoming, setLastIncoming] = useState<MunicipalNotification | null>(null);
  const mountedRef = useRef(true);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notificationService.getNotifications(userId);
      if (mountedRef.current) {
        setNotifications(data);
      }
    } catch {
      if (mountedRef.current) {
        setError('Unable to load notifications. Please try again.');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;
    void refreshNotifications();

    // Real-time ready: any event emitted by the service is merged into
    // the centralized state, bumping the unread count + bell badge.
    const unsubscribe = notificationService.subscribeToNotifications((incoming) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === incoming.id)) return prev;
        const next = [incoming, ...prev];
        // Keep the list bounded; newest items are retained.
        return next.length > 30 ? next.slice(0, 30) : next;
      });
      setLastIncoming(incoming);
    });

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    void notificationService.markNotificationRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void notificationService.markAllNotificationsRead();
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    void notificationService.deleteNotification(id);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const openNotification = useCallback(
    (id: string) => {
      markAsRead(id);
    },
    [markAsRead]
  );

  const clearLastIncoming = useCallback(() => setLastIncoming(null), []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
      refreshNotifications,
      openNotification,
      lastIncoming,
      clearLastIncoming,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearNotifications,
      refreshNotifications,
      openNotification,
      lastIncoming,
      clearLastIncoming,
    ]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

export default NotificationProvider;
