// lib/api.ts

import { toastError } from '@/lib/toast';
import { useUIStore } from "@/stores/uiStore";
import { API_ENDPOINTS } from "./apiEndpoints";
import { API_URL_PLACEHOLDER, resolveApiUrlRaw } from './env';
import { UploadResult } from './types';
import Constants from 'expo-constants';

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
let refreshTokenInMemory: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

const STORAGE_KEY = '@mechafrica:auth';

export async function loadTokensFromStorage(): Promise<void> {
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    authToken = parsed?.accessToken ?? null;
    refreshTokenInMemory = parsed?.refreshToken ?? null;
  } catch {
    // ignore
  }
}

export async function setTokens(accessToken: string | null, refreshToken?: string | null) {
  authToken = accessToken ?? null;
  if (typeof refreshToken !== 'undefined') refreshTokenInMemory = refreshToken ?? null;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    const AsyncStorage = (mod as any).default ?? mod;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: authToken, refreshToken: refreshTokenInMemory }));
  } catch { }
}

export async function clearTokens() {
  authToken = null;
  refreshTokenInMemory = null;
  try { const mod = await import('@react-native-async-storage/async-storage'); const AsyncStorage = (mod as any).default ?? mod; await AsyncStorage.removeItem(STORAGE_KEY); } catch { }
}

export const getAuthToken = () => authToken;

const getBaseUrl = () => {
  // First, try to get from Constants (set at build time from app.config.js)
  // This is critical for production builds where process.env is not available
  let url = Constants.expoConfig?.extra?.apiUrl;

  // Fallback to resolveApiUrlRaw for development
  if (!url) {
    url = resolveApiUrlRaw();
  }

  if (!url) {
    const isDev =
      (typeof __DEV__ !== 'undefined' && __DEV__) ||
      process.env.NODE_ENV !== 'production';
    if (isDev) {
      console.warn(
        "⚠️ API_URL (or EXPO_PUBLIC_API_BASE_URL / EXPO_PUBLIC_API_URL) not set! Using placeholder. Set this in your .env file."
      );
      console.warn("   See .env.example for reference.");
    }
    return API_URL_PLACEHOLDER;
  }
  return url.replace(/\/$/, "");
};

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
let isRefreshing = false;
let refreshWaiters: (() => void)[] = [];

async function doRefresh(): Promise<boolean> {
  if (isRefreshing) {
    // wait for current refresh
    await new Promise<void>((res) => refreshWaiters.push(res));
    return !!authToken;
  }
  isRefreshing = true;
  try {
    const baseUrl = getBaseUrl();
    const token = refreshTokenInMemory;
    if (!token) return false;
    const res = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH_REFRESH ?? '/auth/refresh'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });
    if (!res.ok) return false;
    const parsed = await res.json();
    const newAccess = parsed?.accessToken ?? parsed?.token ?? null;
    const newRefresh = parsed?.refreshToken ?? token;
    if (newAccess) {
      await setTokens(newAccess, newRefresh);
      return true;
    }
    return false;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
    // notify waiters
    const waiters = refreshWaiters.slice();
    refreshWaiters = [];
    waiters.forEach((w) => w());
  }
}

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
  } catch {
    // if enqueue failed silently, proceed to try remote fetch (will fail)
  }
  try {
    const makeRequest = async () => await fetch(`${baseUrl}${endpoint}`, { ...options, headers });

    let res = await makeRequest();

    // if unauthorized, try refresh once then retry
    if (res.status === 401) {
      const refreshed = await doRefresh();
      if (refreshed) {
        // attach new auth header and retry
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers });
      }
    }

    if (!res.ok) {
      const text = await res.text();
      let parsed: any = undefined;
      try {
        parsed = JSON.parse(text);
      } catch { }
      const message = parsed?.message ?? text ?? `API error: ${res.status}`;
      // show toast for non-2xx responses
      toastError('Request failed', message);
      throw new ApiError(message, res.status, parsed);
    }

    // attempt to parse json
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        return (await res.json()) as T;
      } catch {
        const msg = "Failed to parse JSON response";
        toastError('Response error', msg);
        throw new ApiError(msg, res.status);
      }
    }

    // fallback: try to return text as any
    const text = await res.text();
    return text as unknown as T;
  } catch (err: any) {
    // Network or other unexpected errors
    toastError('Network error', err?.message ?? String(err));
    throw err;
  }
}

/* ---------- Small API client helpers ---------- */

export type MinimalUser = { id: string; name?: string; phone?: string; email?: string; avatar?: string };

export const auth = {
  sendOtp: (phone: string, country?: string) => apiFetch<{ ok: boolean }>(API_ENDPOINTS.AUTH_SEND_OTP, {
    method: "POST",
    // Send both variants to be compatible with different backend contracts
    body: JSON.stringify({ Phone: phone, phone_number: phone, phone: phone, Country: country }),
  }),
  verifyOtp: (phone: string, code: string) => apiFetch<{ token: string; user?: MinimalUser }>(API_ENDPOINTS.AUTH_VERIFY_OTP, {
    method: "POST",
    // Send both OTP and otp plus phone variants to maximize compatibility
    body: JSON.stringify({
      Phone: phone,
      phone_number: phone,
      phone: phone,
      OTP: code,
      otp: code,
      code: code,
      verification_code: code,
    }),
  }),
};

export const requests = {
  list: () => apiFetch<{ requests: any[] }>(API_ENDPOINTS.REQUESTS),
  create: (payload: any) => apiFetch<any>(API_ENDPOINTS.REQUESTS, { method: "POST", body: JSON.stringify(payload) }),
  delete: (id: string) => apiFetch<void>(`${API_ENDPOINTS.REQUESTS}/${id}`, { method: "DELETE" }),
};

export const farmer = {
  profile: () => apiFetch<{ profile: any; farms: any[] }>(API_ENDPOINTS.FARMER_PROFILE),
  saveProfile: (payload: any) =>
    apiFetch<any>(API_ENDPOINTS.FARMER_PROFILE, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addFarm: (payload: any) => apiFetch<any>(API_ENDPOINTS.FARMER_FARMS, { method: "POST", body: JSON.stringify(payload) }),
  deleteFarm: (id: string) => apiFetch<void>(`${API_ENDPOINTS.FARMER_FARMS}/${id}`, { method: "DELETE" }),
};

/**
 * Upload helper: performs multipart/form-data upload and returns parsed JSON.
 * Note: in React Native (Expo) FormData usage varies; pass `file` as { uri, name, type }.
 */
export async function uploadFile(endpoint: string, file: { uri: string; name?: string; type?: string }, fieldName = "file"): Promise<UploadResult | any> {
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
    return (await res.json()) as UploadResult;
  } catch {
    return await res.text();
  }
}

export async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const baseUrl = getBaseUrl();
  const headers: Record<string, string> = {};

  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  let res = await fetch(`${baseUrl}${endpoint}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    const refreshed = await doRefresh();
    if (refreshed && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers,
        body: formData,
      });
    }
  }

  if (!res.ok) {
    const text = await res.text();
    let parsed: any = undefined;
    try { parsed = JSON.parse(text); } catch { }
    const message = parsed?.message ?? `Upload error: ${res.status}`;
    toastError('Upload failed', message);
    throw new ApiError(message, res.status, parsed);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export default apiFetch;
