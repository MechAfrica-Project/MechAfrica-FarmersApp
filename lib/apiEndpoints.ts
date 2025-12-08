// lib/apiEndpoints.ts
// Centralized API endpoint constants for the app.
export const API_ENDPOINTS = {
  // Auth
  AUTH_SEND_OTP: "/auth/send-otp",
  AUTH_VERIFY_OTP: "/auth/verify-otp",
  AUTH_ME: "/auth/me",
  AUTH_REFRESH: "/auth/refresh",

  // Requests
  REQUESTS: "/requests",

  // Farmer
  FARMER_PROFILE: "/farmer/profile",
  FARMER_FARMS: "/farmer/farms",

  // Uploads
  UPLOADS: "/uploads",

  // Notifications - General endpoints (for all authenticated users)
  NOTIFICATIONS: "/api/v1/notifications",
  NOTIFICATION_BY_ID: "/api/v1/notifications", // Append /:id
  NOTIFICATION_MARK_READ: "/api/v1/notifications", // Append /:id/read
  NOTIFICATION_MARK_ALL_READ: "/api/v1/notifications/mark-all-read",
  NOTIFICATION_UNREAD_COUNT: "/api/v1/notifications/unread-count",
  NOTIFICATION_STATS: "/api/v1/notifications/stats",

  // Notification Preferences (TODO: under development on backend)
  NOTIFICATION_PREFERENCES: "/api/v1/notification-preferences",
  NOTIFICATION_PREFERENCES_TEST: "/api/v1/notification-preferences/test",

  // Admin Notifications
  ADMIN_NOTIFICATION_CLEANUP: "/api/v1/admin/notifications/cleanup/expired",

  // Push Notifications
  PUSH_TOKEN_REGISTER: "/api/v1/push/token",
  PUSH_TOKEN_UNREGISTER: "/api/v1/push/token/unregister",
  PUSH_TOKEN_DEACTIVATE: "/api/v1/push/tokens/deactivate",
  PUSH_TOKENS_LIST: "/api/v1/push/tokens",
  PUSH_TEST: "/api/v1/push/test",

  // Tips
  FARMER_TIPS: "/farmer/tips",
  FARMER_TIPS_REFRESH: "/farmer/tips/refresh",
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;

export default API_ENDPOINTS;

// Helper functions for templated endpoints
export const endpoints = {
  // Request endpoints
  requestById: (id: string) => `${API_ENDPOINTS.REQUESTS}/${id}`,

  // Farm endpoints
  farmerFarmById: (id: string) => `${API_ENDPOINTS.FARMER_FARMS}/${id}`,

  // Upload endpoints
  uploadFile: (filename?: string) => (filename ? `${API_ENDPOINTS.UPLOADS}/${filename}` : API_ENDPOINTS.UPLOADS),

  // Tips endpoints
  tipsByCategory: (category: string) => `${API_ENDPOINTS.FARMER_TIPS}/category/${category}`,
  tipView: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/view`,
  tipAction: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/action`,
  tipFeedback: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/feedback`,
  tipRate: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/rate`,
  tipShare: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/share`,

  // Notification endpoints
  notificationById: (id: string) => `${API_ENDPOINTS.NOTIFICATION_BY_ID}/${id}`,
  notificationMarkRead: (id: string) => `${API_ENDPOINTS.NOTIFICATION_MARK_READ}/${id}/read`,
  notificationDelete: (id: string) => `${API_ENDPOINTS.NOTIFICATION_BY_ID}/${id}`,

  // Notification list with query params
  notificationsList: (params?: { limit?: number; offset?: number; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.type) queryParams.append('type', params.type);
    const queryString = queryParams.toString();
    return queryString ? `${API_ENDPOINTS.NOTIFICATIONS}/?${queryString}` : `${API_ENDPOINTS.NOTIFICATIONS}/`;
  },

  // Notification Preferences endpoints
  notificationPreferencesByType: (type: string) => `${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/type/${type}`,
  notificationPreferencesChannels: () => `${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/channels`,
  notificationPreferencesQuietHours: () => `${API_ENDPOINTS.NOTIFICATION_PREFERENCES}/quiet-hours`,

  // Push notification endpoints
  pushTokenDelete: (token: string) => `${API_ENDPOINTS.PUSH_TOKEN_REGISTER}/${encodeURIComponent(token)}`,
};

export type Endpoints = typeof endpoints;
