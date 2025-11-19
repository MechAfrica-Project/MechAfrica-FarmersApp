// lib/api.ts

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
  sendOtp: (phone: string, country?: string) => apiFetch<{ ok: boolean }>("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ phone, country }),
  }),

  verifyOtp: (phone: string, code: string) => apiFetch<{ token: string; user?: MinimalUser }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, code }),
  }),
};

export const requests = {
  list: () => apiFetch<{ requests: any[] }>("/requests"),
  create: (payload: any) => apiFetch<any>("/requests", { method: "POST", body: JSON.stringify(payload) }),
  delete: (id: string) => apiFetch<void>(`/requests/${id}`, { method: "DELETE" }),
};

export const farmer = {
  profile: () => apiFetch<{ profile: any; farms: any[] }>("/farmer/profile"),
  addFarm: (payload: any) => apiFetch<any>("/farmer/farms", { method: "POST", body: JSON.stringify(payload) }),
  deleteFarm: (id: string) => apiFetch<void>(`/farmer/farms/${id}`, { method: "DELETE" }),
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
