// lib/notificationService.ts
// Comprehensive notification service for interacting with the MechAfrica Notification API

import { apiFetch } from '@/lib/api';
import { API_ENDPOINTS, endpoints } from '@/lib/apiEndpoints';
import {
  UserNotification,
  NotificationStats,
  NotificationsListResponse,
  NotificationResponse,
  UnreadCountResponse,
  NotificationStatsResponse,
  NotificationActionResponse,
  NotificationsQueryParams,
  UserNotificationPreferences,
  NotificationType,
} from '@/types/notification';

/**
 * MechAfrica Notification Service
 *
 * Provides methods for interacting with the notification API endpoints.
 * All methods require the user to be authenticated (JWT token).
 */
export const notificationService = {
  /**
   * Get paginated list of notifications for the authenticated user
   *
   * @param params - Optional query parameters (limit, offset, type)
   * @returns Promise with notifications list response
   */
  async getNotifications(params?: NotificationsQueryParams): Promise<NotificationsListResponse> {
    const endpoint = endpoints.notificationsList({
      limit: params?.limit ?? 20,
      offset: params?.offset ?? 0,
      type: params?.type,
    });
    return apiFetch<NotificationsListResponse>(endpoint);
  },

  /**
   * Get a specific notification by ID
   *
   * @param id - The notification UUID
   * @returns Promise with the notification data
   */
  async getNotificationById(id: string): Promise<NotificationResponse> {
    const endpoint = endpoints.notificationById(id);
    return apiFetch<NotificationResponse>(endpoint);
  },

  /**
   * Mark a specific notification as read
   *
   * @param id - The notification UUID
   * @returns Promise with action response
   */
  async markAsRead(id: string): Promise<NotificationActionResponse> {
    const endpoint = endpoints.notificationMarkRead(id);
    return apiFetch<NotificationActionResponse>(endpoint, {
      method: 'PUT',
    });
  },

  /**
   * Mark all notifications as read for the authenticated user
   *
   * @returns Promise with action response
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    return apiFetch<NotificationActionResponse>(API_ENDPOINTS.NOTIFICATION_MARK_ALL_READ, {
      method: 'PUT',
    });
  },

  /**
   * Delete a specific notification
   *
   * @param id - The notification UUID
   * @returns Promise with action response
   */
  async deleteNotification(id: string): Promise<NotificationActionResponse> {
    const endpoint = endpoints.notificationDelete(id);
    return apiFetch<NotificationActionResponse>(endpoint, {
      method: 'DELETE',
    });
  },

  /**
   * Get the count of unread notifications
   *
   * @returns Promise with unread count
   */
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return apiFetch<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
  },

  /**
   * Get notification statistics for the authenticated user
   *
   * @returns Promise with notification stats
   */
  async getStats(): Promise<NotificationStatsResponse> {
    return apiFetch<NotificationStatsResponse>(API_ENDPOINTS.NOTIFICATION_STATS);
  },

  /**
   * Get user notification preferences
   *
   * @returns Promise with user preferences
   */
  async getPreferences(): Promise<{ success: boolean; message: string; data: UserNotificationPreferences }> {
    return apiFetch<{ success: boolean; message: string; data: UserNotificationPreferences }>(
      API_ENDPOINTS.NOTIFICATION_PREFERENCES
    );
  },

  /**
   * Update user notification preferences
   *
   * @param preferences - Partial preferences to update
   * @returns Promise with action response
   */
  async updatePreferences(
    preferences: Partial<UserNotificationPreferences>
  ): Promise<NotificationActionResponse> {
    return apiFetch<NotificationActionResponse>(API_ENDPOINTS.NOTIFICATION_PREFERENCES, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },

  /**
   * Update a specific notification preference type
   *
   * @param type - The notification type to update
   * @param settings - The preference settings
   * @returns Promise with action response
   */
  async updatePreferenceByType(
    type: NotificationType,
    settings: {
      enabled?: boolean;
      channels?: string[];
      priority?: string;
      frequency?: string;
    }
  ): Promise<NotificationActionResponse> {
    const endpoint = endpoints.notificationPreferencesByType(type);
    return apiFetch<NotificationActionResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Update channel preferences
   *
   * @param channels - Channel settings to update
   * @returns Promise with action response
   */
  async updateChannelPreferences(channels: {
    sms_enabled?: boolean;
    email_enabled?: boolean;
    whatsapp_enabled?: boolean;
    push_enabled?: boolean;
    in_app_enabled?: boolean;
    voice_call_enabled?: boolean;
  }): Promise<NotificationActionResponse> {
    const endpoint = endpoints.notificationPreferencesChannels();
    return apiFetch<NotificationActionResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(channels),
    });
  },

  /**
   * Update quiet hours settings
   *
   * @param settings - Quiet hours configuration
   * @returns Promise with action response
   */
  async updateQuietHours(settings: {
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  }): Promise<NotificationActionResponse> {
    const endpoint = endpoints.notificationPreferencesQuietHours();
    return apiFetch<NotificationActionResponse>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  /**
   * Send a test notification (useful for testing notification settings)
   *
   * @param channel - Optional channel to test (defaults to all enabled channels)
   * @returns Promise with action response
   */
  async sendTestNotification(channel?: string): Promise<NotificationActionResponse> {
    return apiFetch<NotificationActionResponse>(API_ENDPOINTS.NOTIFICATION_PREFERENCES_TEST, {
      method: 'POST',
      body: JSON.stringify({ channel }),
    });
  },

  /**
   * Load more notifications (pagination helper)
   *
   * @param currentOffset - Current offset in the list
   * @param limit - Number of items to fetch
   * @param type - Optional notification type filter
   * @returns Promise with notifications list response
   */
  async loadMore(
    currentOffset: number,
    limit: number = 20,
    type?: NotificationType
  ): Promise<NotificationsListResponse> {
    return this.getNotifications({
      limit,
      offset: currentOffset,
      type,
    });
  },

  /**
   * Fetch all notifications of a specific type
   *
   * @param type - The notification type to filter by
   * @param limit - Maximum number to fetch (default 50)
   * @returns Promise with notifications list response
   */
  async getNotificationsByType(
    type: NotificationType,
    limit: number = 50
  ): Promise<NotificationsListResponse> {
    return this.getNotifications({
      limit,
      offset: 0,
      type,
    });
  },
};

/**
 * Admin-only notification operations
 * These require admin authentication
 */
export const adminNotificationService = {
  /**
   * Cleanup all expired notifications from the system
   *
   * @returns Promise with action response
   */
  async cleanupExpired(): Promise<NotificationActionResponse> {
    return apiFetch<NotificationActionResponse>(API_ENDPOINTS.ADMIN_NOTIFICATION_CLEANUP, {
      method: 'DELETE',
    });
  },
};

/**
 * Helper function to extract notifications array from API response
 * Handles different response formats for backwards compatibility
 */
export function extractNotifications(response: any): UserNotification[] {
  if (!response) return [];

  // Standard API response format
  if (response.data?.notifications) {
    return response.data.notifications;
  }

  // Direct notifications array in data
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Notifications array at root
  if (response.notifications) {
    return response.notifications;
  }

  // Direct array response
  if (Array.isArray(response)) {
    return response;
  }

  return [];
}

/**
 * Helper function to extract unread count from various response formats
 */
export function extractUnreadCount(response: any): number {
  if (!response) return 0;

  // Standard format
  if (typeof response.data?.unread_count === 'number') {
    return response.data.unread_count;
  }

  // Direct property
  if (typeof response.unread_count === 'number') {
    return response.unread_count;
  }

  // Nested in data
  if (typeof response.data?.unreadCount === 'number') {
    return response.data.unreadCount;
  }

  return 0;
}

/**
 * Helper function to extract stats from API response
 */
export function extractStats(response: any): NotificationStats | null {
  if (!response) return null;

  // Standard format
  if (response.data && typeof response.data.total === 'number') {
    return response.data as NotificationStats;
  }

  // Direct stats object
  if (typeof response.total === 'number') {
    return response as NotificationStats;
  }

  return null;
}

export default notificationService;
