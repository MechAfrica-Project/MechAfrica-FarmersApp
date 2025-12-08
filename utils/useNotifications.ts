// utils/useNotifications.ts
// Custom hook for convenient notification management in React components

import { useCallback, useEffect, useRef } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import {
  UserNotification,
  NotificationStats,
  NotificationFilterType,
  isNotificationRead,
  formatNotificationTime,
} from '@/types/notification';
import { router } from 'expo-router';

// Polling interval for unread count (30 seconds)
const POLLING_INTERVAL = 30000;

interface UseNotificationsOptions {
  /** Enable automatic polling for unread count */
  enablePolling?: boolean;
  /** Custom polling interval in milliseconds */
  pollingInterval?: number;
  /** Auto-fetch on mount */
  autoFetch?: boolean;
  /** Initial type filter */
  initialFilter?: NotificationFilterType;
}

interface UseNotificationsReturn {
  // Data
  notifications: UserNotification[];
  filteredNotifications: UserNotification[];
  unreadNotifications: UserNotification[];
  unreadCount: number;
  stats: NotificationStats;
  total: number;

  // State
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;
  hasMore: boolean;

  // Filter
  currentFilter: NotificationFilterType;
  setFilter: (filter: NotificationFilterType) => void;

  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  handleNotificationPress: (notification: UserNotification) => void;

  // Utilities
  getNotificationById: (id: string) => UserNotification | undefined;
  isRead: (notification: UserNotification) => boolean;
  formatTime: (timestamp: string) => string;
}

/**
 * Custom hook for managing notifications
 *
 * Provides a convenient interface for:
 * - Fetching and displaying notifications
 * - Pagination (load more)
 * - Filtering by type
 * - Marking notifications as read
 * - Deleting notifications
 * - Auto-polling for unread count
 *
 * @example
 * ```tsx
 * const {
 *   notifications,
 *   unreadCount,
 *   loading,
 *   refresh,
 *   markAsRead,
 *   handleNotificationPress,
 * } = useNotifications({ enablePolling: true });
 * ```
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    enablePolling = false,
    pollingInterval = POLLING_INTERVAL,
    autoFetch = true,
    initialFilter = 'all',
  } = options;

  // Store state and actions
  const items = useNotificationStore((s) => s.items);
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const stats = useNotificationStore((s) => s.stats);
  const total = useNotificationStore((s) => s.total);
  const loading = useNotificationStore((s) => s.loading);
  const loadingMore = useNotificationStore((s) => s.loadingMore);
  const refreshing = useNotificationStore((s) => s.refreshing);
  const error = useNotificationStore((s) => s.error);
  const hasMore = useNotificationStore((s) => s.hasMore);
  const filter = useNotificationStore((s) => s.filter);

  const setFilter = useNotificationStore((s) => s.setFilter);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const loadMoreNotifications = useNotificationStore((s) => s.loadMoreNotifications);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const refreshAll = useNotificationStore((s) => s.refreshAll);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const deleteNotificationStore = useNotificationStore((s) => s.deleteNotification);
  const getFilteredItems = useNotificationStore((s) => s.getFilteredItems);
  const getUnreadItems = useNotificationStore((s) => s.getUnreadItems);
  const getNotificationByIdStore = useNotificationStore((s) => s.getNotificationById);

  // Polling ref to track interval
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set initial filter on mount
  useEffect(() => {
    if (initialFilter !== 'all' && filter !== initialFilter) {
      setFilter(initialFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFilter]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]);

  // Setup polling for unread count
  useEffect(() => {
    if (enablePolling) {
      // Initial fetch
      fetchUnreadCount();

      // Setup interval
      pollingRef.current = setInterval(() => {
        fetchUnreadCount();
      }, pollingInterval);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enablePolling, pollingInterval]);

  // Refresh all notifications
  const refresh = useCallback(async () => {
    await refreshAll();
  }, [refreshAll]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!loadingMore && hasMore) {
      await loadMoreNotifications();
    }
  }, [loadMoreNotifications, loadingMore, hasMore]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      await markRead(id);
    },
    [markRead]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    await markAllRead();
  }, [markAllRead]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      await deleteNotificationStore(id);
    },
    [deleteNotificationStore]
  );

  // Handle notification press - mark as read and navigate if action_url exists
  const handleNotificationPress = useCallback(
    (notification: UserNotification) => {
      // Mark as read first
      if (!isNotificationRead(notification)) {
        markRead(notification.id);
      }

      // Navigate to action URL if present
      if (notification.action_url) {
        try {
          // Handle internal app routes
          if (notification.action_url.startsWith('/')) {
            router.push(notification.action_url as any);
          } else {
            // For external URLs, you might want to use Linking
            // For now, try as internal route
            router.push(notification.action_url as any);
          }
        } catch (err) {
          console.warn('Navigation failed for action_url:', notification.action_url, err);
        }
      }
    },
    [markRead]
  );

  // Get notification by ID
  const getNotificationById = useCallback(
    (id: string) => {
      return getNotificationByIdStore(id);
    },
    [getNotificationByIdStore]
  );

  // Check if notification is read
  const isRead = useCallback((notification: UserNotification) => {
    return isNotificationRead(notification);
  }, []);

  // Format notification time
  const formatTime = useCallback((timestamp: string) => {
    return formatNotificationTime(timestamp);
  }, []);

  return {
    // Data
    notifications: items,
    filteredNotifications: getFilteredItems(),
    unreadNotifications: getUnreadItems(),
    unreadCount,
    stats,
    total,

    // State
    loading,
    loadingMore,
    refreshing,
    error,
    hasMore,

    // Filter
    currentFilter: filter,
    setFilter,

    // Actions
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationPress,

    // Utilities
    getNotificationById,
    isRead,
    formatTime,
  };
}

/**
 * Lightweight hook for just the unread count
 * Useful for notification badges in headers/tabs
 */
export function useUnreadCount(enablePolling = true): number {
  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationStore((s) => s.fetchUnreadCount);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();

    if (enablePolling) {
      pollingRef.current = setInterval(() => {
        fetchUnreadCount();
      }, POLLING_INTERVAL);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enablePolling]);

  return unreadCount;
}

/**
 * Hook for notification statistics
 */
export function useNotificationStats(): {
  stats: NotificationStats;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const stats = useNotificationStore((s) => s.stats);
  const loading = useNotificationStore((s) => s.loading);
  const fetchStats = useNotificationStore((s) => s.fetchStats);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  return { stats, loading, refresh };
}

export default useNotifications;
