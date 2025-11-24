// lib/api.ts

import { useUIStore } from "@/stores/uiStore";
import { API_ENDPOINTS } from "./apiEndpoints";

// offline enqueue helper: enqueue write requests when offline
async function enqueueIfOffline(method: string, endpoint: string, body?: any) {
  try {
    const online = useUIStore.getState().online;
    if (online) return null;
    if (!['POST', 'PUT', 'DELETE'].includes(method.toUpperCase())) return null;
    const queue = await import('./offlineQueue');
    const id = await queue.enqueueRequest(method, endpoint, body);
    return id;
  } catch {
    return null;
  }
}

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const getBaseUrl = () => process.env.EXPO_PUBLIC_API_URL ?? "https://your-api.com";

export class ApiError extends Error {
  status?: number;
  body?: any;
  constructor(message: string, status?: number, body?: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/**
 * A typed fetch wrapper for your API.
 * - Automatically adds JSON headers
 * - Adds Authorization header if token exists
 * - Parses JSON safely
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();

  // ensure we don't accidentally share headers reference
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  // If offline and this is a write request, enqueue and throw to allow callers to fallback.
  const method = (options.method ?? 'GET').toUpperCase();
  try {
    const queuedId = await enqueueIfOffline(method, endpoint, options.body ? JSON.parse(String(options.body)) : undefined);
    if (queuedId) {
      // Return a friendly queued response instead of throwing so callers can continue.
      return ({ queued: true, queuedId } as unknown) as T;
    }
  } catch (err) {
    // if enqueue failed silently, proceed to try remote fetch (will fail)
  }

  const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = undefined;
    try {
      parsed = JSON.parse(text);
    } catch {}
    throw new ApiError(parsed?.message ?? text ?? `API error: ${res.status}`, res.status, parsed);
  }

  // attempt to parse json
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return (await res.json()) as T;
    } catch (err) {
      throw new ApiError("Failed to parse JSON response", res.status);
    }
  }

  // fallback: try to return text as any
  const text = await res.text();
  return text as unknown as T;
}

/* ---------- Small API client helpers ---------- */

export type MinimalUser = { id: string; name?: string; phone?: string; email?: string; avatar?: string };

export const auth = {
  sendOtp: (phone: string, country?: string) => apiFetch<{ ok: boolean }>(API_ENDPOINTS.AUTH_SEND_OTP, {
    method: "POST",
    body: JSON.stringify({ phone, country }),
  }),
  verifyOtp: (phone: string, code: string) => apiFetch<{ token: string; user?: MinimalUser }>(API_ENDPOINTS.AUTH_VERIFY_OTP, {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  }),
};

export const requests = {
  list: () => apiFetch<{ requests: any[] }>(API_ENDPOINTS.REQUESTS),
  create: (payload: any) => apiFetch<any>(API_ENDPOINTS.REQUESTS, { method: "POST", body: JSON.stringify(payload) }),
  delete: (id: string) => apiFetch<void>(`${API_ENDPOINTS.REQUESTS}/${id}`, { method: "DELETE" }),
};

export const farmer = {
  profile: () => apiFetch<{ profile: any; farms: any[] }>(API_ENDPOINTS.FARMER_PROFILE),
  addFarm: (payload: any) => apiFetch<any>(API_ENDPOINTS.FARMER_FARMS, { method: "POST", body: JSON.stringify(payload) }),
  deleteFarm: (id: string) => apiFetch<void>(`${API_ENDPOINTS.FARMER_FARMS}/${id}`, { method: "DELETE" }),
};

/**
 * Upload helper: performs multipart/form-data upload and returns parsed JSON.
 * Note: in React Native (Expo) FormData usage varies; pass `file` as { uri, name, type }.
 */
export async function uploadFile(endpoint: string, file: { uri: string; name?: string; type?: string }, fieldName = "file") {
  const baseUrl = getBaseUrl();
  const form = new FormData();
  // @ts-ignore - React Native expects an object with uri/name/type
  form.append(fieldName, { uri: file.uri, name: file.name ?? "upload.jpg", type: file.type ?? "image/jpeg" });

  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    body: form as any,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || `Upload failed: ${res.status}`, res.status);
  }

  try {
    return await res.json();
  } catch (err) {
    return await res.text();
  }
}

export default apiFetch;
