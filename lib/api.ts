
// lib/api.ts
// Lightweight stubbed API layer for local development (no network).
// When ready to use a real backend, replace apiFetch with real fetch logic
// and remove or adapt the stubs below.

export const API_BASE = ""; // keep if you plan to add a real base URL later

let authToken: string | null = null;

/** Called by authStore when token changes */
export function setAuthToken(token: string | null) {
  authToken = token;
}

/**
 * Stubbed apiFetch - returns fake data for known endpoints and a generic
 * success object otherwise. No network calls are made.
 *
 * This prevents "JSON Parse error" and similar issues while you work on UIs.
 */
export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // small delay to simulate network latency
  await new Promise((res) => setTimeout(res, 350));

  // Basic routing for common auth endpoints used in the app
  if (endpoint.includes("/send-otp")) {
    // simulate a 200 ok
    return ({} as unknown) as T;
  }

  if (endpoint.includes("/verify-otp")) {
    // return fake user + token
    return ({
      user: {
        id: "mock-user-1",
        name: "Demo Farmer",
        email: "demo@mechafrica.org",
        phone: "0240000000",
      },
      token: "mock-token-123456",
    } as unknown) as T;
  }

  if (endpoint.includes("/me")) {
    // simulate logged-in user (if authToken exists)
    if (authToken) {
      return ({
        user: {
          id: "mock-user-1",
          name: "Demo Farmer",
          email: "demo@mechafrica.org",
          phone: "0240000000",
        },
      } as unknown) as T;
    } else {
      // simulate unauthorized / no user
      throw new Error("Not authenticated");
    }
  }

  // Generic successful fallback
  return ({} as unknown) as T;
}

/*
TODO: To restore real network calls, replace the body of apiFetch with:
  const res = await fetch(`${API_BASE}${endpoint}`, { headers: {...}, ...options });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.message || "Something went wrong");
  return data as T;
and keep setAuthToken to attach Authorization header.
*/







































// // lib/api.ts
// export const API_BASE = ""; // Set if you have a base URL

// let authToken: string | null = null;

// /** Called by authStore when token changes */
// export function setAuthToken(token: string | null) {
//   authToken = token;
// }

// // Generic API fetch with token support
// export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
//       ...(options.headers || {}),
//     };

//     const res = await fetch(`${API_BASE}${endpoint}`, {
//       headers,
//       ...options,
//     });

//     // try to parse JSON safely
//     const text = await res.text();
//     let data: any = text ? JSON.parse(text) : {};
//     if (!res.ok) {
//       throw new Error(data?.message || "Something went wrong");
//     }
//     return data as T;
//   } catch (err: any) {
//     console.error("API Error:", err?.message ?? err);
//     throw err;
//   }
// }
