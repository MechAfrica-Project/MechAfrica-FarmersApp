// lib/api.ts
import * as SecureStore from "expo-secure-store";

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

/**
 * A typed fetch wrapper for your API.
 * - Automatically adds JSON headers
 * - Adds Authorization header if token exists
 * - Parses JSON safely
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? "https://your-api.com";

  // ✅ force plain object so we can safely index keys
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error: ${res.status}`);
  }

  try {
    // ✅ explicitly cast json() result to T
    const data: T = await res.json();
    return data;
  } catch {
    throw new Error("Failed to parse JSON response");
  }
}
