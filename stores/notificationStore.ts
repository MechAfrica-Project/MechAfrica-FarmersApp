// stores/notificationStore.ts
// Comprehensive notification store matching MechAfrica backend API specification

import { create } from 'zustand';
import { notificationService, extractNotifications, extractUnreadCount, extractStats } from '@/lib/notificationService';
import {
  UserNotification,
  NotificationStats,
  NotificationType,
  NotificationFilterType,
  isNotificationRead,
} from '@/types/notification';

// Default stats object
const defaultStats: NotificationStats = {
  total: 0,
  unread: 0,
  read: 0,
  by_type: [],
  recent: 0,
};

interface NotificationState {
  // Data
  items: UserNotification[];
  stats: NotificationStats;
  unreadCount: number;

  // Pagination
  limit: number;
  offset: number;
  total: number;
  hasMore: boolean;

  // Filters
  filter: NotificationFilterType;
  typeFilter: NotificationType | null;

  // Loading states
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  error: string | null;

  // Last fetch timestamp for polling
  lastFetchTime: number | null;

  // Actions - Filters
  setFilter: (filter: NotificationFilterType) => void;
  setTypeFilter: (type: NotificationType | null) => void;

  // Actions - Data fetching
  fetchNotifications: (refresh?: boolean) => Promise<void>;
  loadMoreNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchStats: () => Promise<void>;
  refreshAll: () => Promise<void>;

  // Actions - Single notification operations
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Actions - Local state management
  addNotification: (notification: UserNotification) => void;
  addMany: (notifications: UserNotification[]) => void;
  updateNotification: (id: string, updates: Partial<UserNotification>) => void;
  removeNotification: (id: string) => void;
  clear: () => void;

  // Actions - Optimistic updates
  optimisticMarkRead: (id: string) => void;
  optimisticMarkAllRead: () => void;
  optimisticDelete: (id: string) => void;

  // Computed getters
  getFilteredItems: () => UserNotification[];
  getUnreadItems: () => UserNotification[];
  getNotificationById: (id: string) => UserNotification | undefined;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  // Initial state
  items: [],
  stats: defaultStats,
  unreadCount: 0,

  limit: 20,
  offset: 0,
  total: 0,
  hasMore: true,

  filter: 'all',
  typeFilter: null,

  loading: false,
  loadingMore: false,
  refreshing: false,
  error: null,

  lastFetchTime: null,

  // Filter actions
  setFilter: (filter) => {
    set({ filter });
    // Re-fetch with new filter if it's a type filter
    if (filter !== 'all') {
      set({ typeFilter: filter as NotificationType, offset: 0, items: [] });
      get().fetchNotifications(true);
    } else {
      set({ typeFilter: null, offset: 0, items: [] });
      get().fetchNotifications(true);
    }
  },

  setTypeFilter: (type) => {
    set({ typeFilter: type, offset: 0, items: [] });
    get().fetchNotifications(true);
  },

  // Fetch notifications from API
  fetchNotifications: async (refresh = false) => {
    const state = get();

    // Prevent duplicate requests
    if (state.loading && !refresh) return;

    set({
      loading: true,
      error: null,
      ...(refresh ? { offset: 0, items: [] } : {}),
    });

    try {
      const response = await notificationService.getNotifications({
        limit: state.limit,
        offset: refresh ? 0 : state.offset,
        type: state.typeFilter ?? undefined,
      });

      const notifications = extractNotifications(response);
      const unreadCount = extractUnreadCount(response);
      const total = response.data?.total ?? notifications.length;

      // Deduplicate items to prevent React key collision errors
      const currentItems = refresh ? [] : state.items;
      const existingIds = new Set(currentItems.map(item => item.id));
      const newItems = notifications.filter(item => !existingIds.has(item.id));
      const mergedItems = [...currentItems, ...newItems];

      set({
        items: mergedItems,
        unreadCount,
        total,
        offset: refresh ? notifications.length : state.offset + notifications.length,
        hasMore: notifications.length >= state.limit,
        loading: false,
        lastFetchTime: Date.now(),
      });
    } catch (err: any) {
      console.warn('fetchNotifications failed:', err);
      set({
        loading: false,
        error: err?.message ?? 'Failed to fetch notifications',
      });
    }
  },

  // Load more notifications (pagination)
  loadMoreNotifications: async () => {
    const state = get();

    if (state.loadingMore || !state.hasMore) return;

    set({ loadingMore: true, error: null });

    try {
      const response = await notificationService.loadMore(
        state.offset,
        state.limit,
        state.typeFilter ?? undefined
      );

      const notifications = extractNotifications(response);

      set({
        items: [...state.items, ...notifications],
        offset: state.offset + notifications.length,
        hasMore: notifications.length >= state.limit,
        loadingMore: false,
      });
    } catch (err: any) {
      console.warn('loadMoreNotifications failed:', err);
      set({
        loadingMore: false,
        error: err?.message ?? 'Failed to load more notifications',
      });
    }
  },

  // Fetch unread count only (lightweight)
  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      const unreadCount = extractUnreadCount(response);
      set({ unreadCount });
    } catch (err) {
      console.warn('fetchUnreadCount failed:', err);
    }
  },

  // Fetch notification statistics
  fetchStats: async () => {
    try {
      const response = await notificationService.getStats();
      const stats = extractStats(response);
      if (stats) {
        set({ stats, unreadCount: stats.unread });
      }
    } catch (err) {
      console.warn('fetchStats failed:', err);
    }
  },

  // Refresh all notification data
  refreshAll: async () => {
    set({ refreshing: true });

    try {
      await Promise.all([
        get().fetchNotifications(true),
        get().fetchStats(),
      ]);
    } finally {
      set({ refreshing: false });
    }
  },

  // Mark a single notification as read
  markRead: async (id) => {
    const state = get();
    const notification = state.items.find((n) => n.id === id);

    // Skip if already read
    if (notification && isNotificationRead(notification)) return;

    // Optimistic update
    get().optimisticMarkRead(id);

    try {
      await notificationService.markAsRead(id);
    } catch (err: any) {
      console.warn('markRead failed:', err);
      // Revert optimistic update on failure
      if (notification) {
        get().updateNotification(id, { read_at: null, status: notification.status });
      }
      // Refresh to get accurate state
      get().fetchUnreadCount();
    }
  },

  // Mark all notifications as read
  markAllRead: async () => {
    // Optimistic update
    get().optimisticMarkAllRead();

    try {
      await notificationService.markAllAsRead();
    } catch (err: any) {
      console.warn('markAllRead failed:', err);
      // Refresh to get accurate state
      get().fetchNotifications(true);
    }
  },

  // Delete a notification
  deleteNotification: async (id) => {
    const state = get();
    const notification = state.items.find((n) => n.id === id);

    // Optimistic update
    get().optimisticDelete(id);

    try {
      await notificationService.deleteNotification(id);
    } catch (err: any) {
      console.warn('deleteNotification failed:', err);
      // Revert optimistic update on failure
      if (notification) {
        set({
          items: [...state.items.filter((n) => n.id !== id), notification].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
        });
      }
      // Refresh to get accurate count
      get().fetchUnreadCount();
    }
  },

  // Local state management
  addNotification: (notification) => {
    set((state) => ({
      items: [notification, ...state.items],
      unreadCount: isNotificationRead(notification) ? state.unreadCount : state.unreadCount + 1,
      total: state.total + 1,
    }));
  },

  addMany: (notifications) => {
    const unreadInNew = notifications.filter((n) => !isNotificationRead(n)).length;
    set((state) => ({
      items: [...notifications, ...state.items],
      unreadCount: state.unreadCount + unreadInNew,
      total: state.total + notifications.length,
    }));
  },

  updateNotification: (id, updates) => {
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, ...updates } : n)),
    }));
  },

  removeNotification: (id) => {
    const notification = get().items.find((n) => n.id === id);
    const wasUnread = notification && !isNotificationRead(notification);

    set((state) => ({
      items: state.items.filter((n) => n.id !== id),
      unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      total: Math.max(0, state.total - 1),
    }));
  },

  clear: () => {
    set({
      items: [],
      stats: defaultStats,
      unreadCount: 0,
      offset: 0,
      total: 0,
      hasMore: true,
      error: null,
    });
  },

  // Optimistic updates
  optimisticMarkRead: (id) => {
    const now = new Date().toISOString();
    set((state) => {
      const notification = state.items.find((n) => n.id === id);
      const wasUnread = notification && !isNotificationRead(notification);

      return {
        items: state.items.map((n) =>
          n.id === id ? { ...n, read_at: now, status: 'read' as const } : n
        ),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    });
  },

  optimisticMarkAllRead: () => {
    const now = new Date().toISOString();
    set((state) => ({
      items: state.items.map((n) => ({
        ...n,
        read_at: n.read_at ?? now,
        status: 'read' as const,
      })),
      unreadCount: 0,
    }));
  },

  optimisticDelete: (id) => {
    get().removeNotification(id);
  },

  // Computed getters
  getFilteredItems: () => {
    const state = get();
    if (state.filter === 'all') {
      return state.items;
    }
    return state.items.filter((n) => n.type === state.filter);
  },

  getUnreadItems: () => {
    return get().items.filter((n) => !isNotificationRead(n));
  },

  getNotificationById: (id) => {
    return get().items.find((n) => n.id === id);
  },
}));

// Export the store type for external use
export type NotificationStore = NotificationState;

export default useNotificationStore;
