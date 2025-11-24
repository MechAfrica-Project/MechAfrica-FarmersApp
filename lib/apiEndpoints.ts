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
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;

export default API_ENDPOINTS;

// Helper functions for templated endpoints
export const endpoints = {
  requestById: (id: string) => `${API_ENDPOINTS.REQUESTS}/${id}`,
  farmerFarmById: (id: string) => `${API_ENDPOINTS.FARMER_FARMS}/${id}`,
  uploadFile: (filename?: string) => (filename ? `${API_ENDPOINTS.UPLOADS}/${filename}` : API_ENDPOINTS.UPLOADS),
};

export type Endpoints = typeof endpoints;
