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

  // Notifications
  NOTIFICATIONS: "/notifications",

  // Tips
  FARMER_TIPS: "/farmer/tips",
  FARMER_TIPS_REFRESH: "/farmer/tips/refresh",
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;

export default API_ENDPOINTS;

// Helper functions for templated endpoints
export const endpoints = {
  requestById: (id: string) => `${API_ENDPOINTS.REQUESTS}/${id}`,
  farmerFarmById: (id: string) => `${API_ENDPOINTS.FARMER_FARMS}/${id}`,
  uploadFile: (filename?: string) => (filename ? `${API_ENDPOINTS.UPLOADS}/${filename}` : API_ENDPOINTS.UPLOADS),
  // Tips endpoints
  tipsByCategory: (category: string) => `${API_ENDPOINTS.FARMER_TIPS}/category/${category}`,
  tipView: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/view`,
  tipAction: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/action`,
  tipFeedback: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/feedback`,
  tipRate: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/rate`,
  tipShare: (tipId: string) => `${API_ENDPOINTS.FARMER_TIPS}/${tipId}/share`,
};

export type Endpoints = typeof endpoints;
