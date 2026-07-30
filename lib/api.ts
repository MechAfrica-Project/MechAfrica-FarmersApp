// lib/api.ts

import { toastError } from '@/lib/toast';
import { useUIStore } from "@/stores/uiStore";
import { API_ENDPOINTS } from "./apiEndpoints";
import { API_URL_PLACEHOLDER, resolveApiUrlRaw } from './env';
import { UploadResult } from './types';
import Constants from 'expo-constants';
import { uploadAsync, FileSystemUploadType } from 'expo-file-system/legacy';

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

import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'mechafrica_accessToken';
const REFRESH_KEY = 'mechafrica_refreshToken';
const DEFAULT_BASE = "https://mechafrica-backend.up.railway.app";

export async function loadTokensFromStorage(): Promise<void> {
  try {
    const access = await SecureStore.getItemAsync(ACCESS_KEY);
    const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
    authToken = access;
    refreshTokenInMemory = refresh;
  } catch {
    // ignore
  }
}

export async function setTokens(accessToken: string | null, refreshToken?: string | null) {
  authToken = accessToken ?? null;
  if (typeof refreshToken !== 'undefined') refreshTokenInMemory = refreshToken ?? null;
  try {
    if (authToken) await SecureStore.setItemAsync(ACCESS_KEY, authToken);
    else await SecureStore.deleteItemAsync(ACCESS_KEY);
    
    if (refreshTokenInMemory) await SecureStore.setItemAsync(REFRESH_KEY, refreshTokenInMemory);
    else await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (err) {
    if (__DEV__) console.warn('Failed to save tokens', err);
  }
}

export async function clearTokens() {
  authToken = null;
  refreshTokenInMemory = null;
  try { 
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (err) {
    if (__DEV__) console.warn('Failed to clear tokens', err);
  }
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
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
  
  toString() {
    return `${this.name}: ${this.status ? `[${this.status}] ` : ''}${this.message}`;
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

export interface ApiRequestOptions extends RequestInit {
  suppressToast?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
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
    const makeRequest = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout for slow AI endpoints
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, { ...options, headers, signal: controller.signal });
        clearTimeout(timeout);
        return response;
      } catch (err) {
        clearTimeout(timeout);
        throw err;
      }
    };

    let res = await makeRequest();

    // if unauthorized, try refresh once then retry
    if (res.status === 401) {
      const refreshed = await doRefresh();
      if (refreshed) {
        // attach new auth header and retry
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        res = await makeRequest();
      }
    }

    if (!res.ok) {
      const text = await res.text();
      let parsed: any = undefined;
      try {
        parsed = JSON.parse(text);
      } catch {
        if (__DEV__) console.warn('Could not parse error response JSON:', text);
      }
      const message = parsed?.message ?? text ?? `API error: ${res.status}`;
      
      if (__DEV__) {
        console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed with ${res.status}: ${message}`);
      }

      // UX Overhaul: 4xx Client Errors (Form Validation, Bad Requests) should not show a global toast.
      // They should be handled inline. 5xx Server Errors should show toasts.
      const isClientError = res.status >= 400 && res.status < 500;
      const isAuthEndpoint = endpoint.includes('/auth/');
      const userRequestedSuppress = options.suppressToast === true;
      
      let shouldSuppressToast = false;
      if (userRequestedSuppress) {
        shouldSuppressToast = true;
      } else if (isClientError) {
        shouldSuppressToast = true;
      } else if (isAuthEndpoint) {
        shouldSuppressToast = true; // Let authStore handle auth errors to avoid duplicate toasts
      }
      
      if (!shouldSuppressToast) {
        toastError('Request failed', message);
      }
      throw new ApiError(message, res.status, parsed);
    }

    // attempt to parse json
    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const parsedData = await res.json();
        // If it's a successful GET, attempt to update cache (fire and forget)
        if (method === 'GET' && !endpoint.includes('/auth/')) {
          import('./offlineQueue').then(q => q.setCache(endpoint, parsedData)).catch(() => {});
        }
        return parsedData as T;
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
    // If it's a GET request and we failed, try to fallback to cache
    if (method === 'GET' && !endpoint.includes('/auth/')) {
      try {
        const queue = await import('./offlineQueue');
        const cached = await queue.getCache(endpoint);
        if (cached !== null) {
          if (__DEV__) console.log(`[API] Fallback to cache for ${endpoint}`);
          return cached as T;
        }
      } catch { }
    }

    // Network or other unexpected errors
    const rawMsg = err?.message ?? String(err);
    let userMsg = rawMsg;
    if (rawMsg.includes('UnknownHostException') || rawMsg.includes('Network request failed') || rawMsg.includes('fetch failed')) {
      userMsg = "You appear to be offline or the server is unreachable. Please check your connection.";
    }

    const isAuthEndpoint = endpoint.includes('/auth/');
    if (options.suppressToast !== true && !isAuthEndpoint) {
      toastError('Network error', userMsg);
    }
    if (err instanceof Error) {
      err.message = userMsg;
      throw err;
    }
    throw new Error(userMsg);
  }
}

/* ---------- Small API client helpers ---------- */

export type MinimalUser = { id: string; name?: string; phone?: string; email?: string; avatar?: string };

export const auth = {
  sendOtp: (phone: string, country?: string, isSignUp?: boolean) => apiFetch<{ ok: boolean }>(API_ENDPOINTS.AUTH_SEND_OTP, {
    method: "POST",
    body: JSON.stringify({ Phone: phone, phone_number: phone, phone: phone, Country: country, role: "farmer", isSignUp: isSignUp || false }),
  }),
  verifyOtp: (phone: string, code: string) => apiFetch<{ token: string; user?: MinimalUser }>(API_ENDPOINTS.AUTH_VERIFY_OTP, {
    method: "POST",
    body: JSON.stringify({
      Phone: phone,
      phone_number: phone,
      phone: phone,
      OTP: code,
      otp: code,
      code: code,
      verification_code: code,
      role: "farmer",
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
 * Upload helper: performs multipart/form-data upload using expo-file-system's
 * uploadAsync, which bypasses the Expo winter-fetch layer entirely.
 * This is the ONLY reliable way to upload local file:// URIs in Expo SDK 56+.
 */
export async function uploadFile(endpoint: string, file: { uri: string; name?: string; type?: string }, fieldName = "file"): Promise<UploadResult | any> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {};
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await uploadAsync(url, file.uri, {
    httpMethod: "POST",
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName,
    mimeType: file.type ?? "application/octet-stream",
    parameters: {},
    headers,
  });

  if (res.status === 401) {
    const refreshed = await doRefresh();
    if (refreshed && authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
      const retryRes = await uploadAsync(url, file.uri, {
        httpMethod: "POST",
        uploadType: FileSystemUploadType.MULTIPART,
        fieldName,
        mimeType: file.type ?? "application/octet-stream",
        parameters: {},
        headers,
      });
      if (retryRes.status < 200 || retryRes.status >= 300) {
        const message = `Upload error: ${retryRes.status}`;
        toastError('Upload failed', message);
        throw new ApiError(message, retryRes.status);
      }
      try {
        return JSON.parse(retryRes.body);
      } catch {
        return retryRes.body;
      }
    }
  }

  if (res.status < 200 || res.status >= 300) {
    let parsed: any = undefined;
    try { parsed = JSON.parse(res.body); } catch { }
    const message = parsed?.message ?? `Upload error: ${res.status}`;
    toastError('Upload failed', message);
    throw new ApiError(message, res.status);
  }

  try {
    return JSON.parse(res.body);
  } catch {
    return res.body;
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
