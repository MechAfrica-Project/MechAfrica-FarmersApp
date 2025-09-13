// stores/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "@/lib/api";
import { router } from "expo-router";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  phone: string | null;
  loading: boolean;
  error: string | null;

  setPhone: (formatted: string, raw: string) => void;
  sendPhone: () => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  phone: null,
  loading: false,
  error: null,

  setPhone: (formatted, raw) => {
    set({ phone: formatted, error: null });
  },

  /**
   * sendPhone
   * Stubbed: doesn't call network. Simulates sending OTP and navigates to verify screen.
   * Keeps behavior simple so UX flows work while building UI.
   */
  sendPhone: async () => {
    const { phone } = get();
    if (!phone) {
      set({ error: "Enter a valid phone number" });
      return;
    }
    set({ loading: true, error: null });
    try {
      // Simulate network delay
      await new Promise((res) => setTimeout(res, 350));

      // In a real app you'd call apiFetch("/send-otp", { method: "POST", body: JSON.stringify({ phone }) })
      // For now just navigate to OTP screen
      set({ loading: false });
      router.push("/(auth)/login/verifyPhone");
    } catch (err: any) {
      set({ error: err?.message ?? "Network error", loading: false });
    }
  },

  /**
   * verifyOtp
   * Stubbed: accepts any code, persists a mock token & user, and navigates to dashboard.
   */
  verifyOtp: async (code) => {
    set({ loading: true, error: null });
    try {
      // simulate verification delay
      await new Promise((res) => setTimeout(res, 450));

      // Fake response (same shape your real API returns)
      const data = {
        user: {
          id: "mock-user-1",
          name: "Demo Farmer",
          email: "demo@mechafrica.org",
          phone: get().phone ?? "0240000000",
        },
        token: "mock-token-123456",
      };

      // persist token locally
      await SecureStore.setItemAsync("token", data.token);

      // inform local API layer about token (no real network, but kept for parity)
      setAuthToken(data.token);

      set({ user: data.user, token: data.token, loading: false });

      // navigate to protected app area
      router.replace("/(tabs)/Dashboard");
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? "Verification failed", loading: false });
      return false;
    }
  },

  /**
   * logout - clears token and user locally
   */
  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    setAuthToken(null);
    set({ user: null, token: null });
    // reset the history stack
    router.replace("/(auth)/login/signIn");
  },

  /**
   * restoreSession - checks local SecureStore for token and restores a mock user if present.
   * No network calls are made.
   */
  restoreSession: async () => {
    set({ loading: true });
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        // inform api layer
        setAuthToken(token);

        // simulate fetching user
        await new Promise((res) => setTimeout(res, 300));

        // restore mock user
        set({
          user: {
            id: "mock-user-1",
            name: "Demo Farmer",
            email: "demo@mechafrica.org",
            phone: "0240000000",
          },
          token,
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ user: null, token: null, loading: false });
      setAuthToken(null);
    }
  },
}));

// // stores/authStore.ts
// import { create } from "zustand";
// import * as SecureStore from "expo-secure-store";
// import { apiFetch, setAuthToken } from "@/lib/api";
// import { router } from "expo-router";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone?: string;
// }

// interface AuthState {
//   user: User | null;
//   token: string | null;
//   phone: string | null;
//   loading: boolean;
//   error: string | null;

//   setPhone: (formatted: string, raw: string) => void;
//   sendPhone: () => Promise<void>;
//   verifyOtp: (code: string) => Promise<boolean>;
//   logout: () => Promise<void>;
//   restoreSession: () => Promise<void>;
// }

// export const useAuthStore = create<AuthState>((set, get) => ({
//   user: null,
//   token: null,
//   phone: null,
//   loading: false,
//   error: null,

//   setPhone: (formatted, raw) => {
//     set({ phone: formatted, error: null });
//   },

//   sendPhone: async () => {
//     const { phone } = get();
//     if (!phone) {
//       set({ error: "Enter a valid phone number" });
//       return;
//     }
//     set({ loading: true, error: null });
//     try {
//       await apiFetch("/send-otp", {
//         method: "POST",
//         body: JSON.stringify({ phone }),
//       });
//       set({ loading: false });
//       router.push("/(auth)/login/verifyPhone");
//     } catch (err: any) {
//       set({ error: err?.message ?? "Network error", loading: false });
//     }
//   },

//   verifyOtp: async (code) => {
//     set({ loading: true, error: null });
//     try {
//       const data = await apiFetch<{ user: User; token: string }>("/verify-otp", {
//         method: "POST",
//         body: JSON.stringify({ phone: get().phone, code }),
//       });

//       await SecureStore.setItemAsync("token", data.token);

//       // critical: inform api module about token (breaks cycle if api didn't import the store)
//       setAuthToken(data.token);

//       set({ user: data.user, token: data.token, loading: false });

//       router.replace("/(tabs)/Dashboard");
//       return true;
//     } catch (err: any) {
//       set({ error: err?.message ?? "Verification failed", loading: false });
//       return false;
//     }
//   },

//   logout: async () => {
//     await SecureStore.deleteItemAsync("token");
//     setAuthToken(null);
//     set({ user: null, token: null });
//     router.replace("/(auth)/login/signIn");
//   },

//   restoreSession: async () => {
//     set({ loading: true });
//     try {
//       const token = await SecureStore.getItemAsync("token");
//       if (token) {
//         // tell api module to attach token automatically
//         setAuthToken(token);

//         // now call /me without passing header manually
//         const data = await apiFetch<{ user: User }>("/me");
//         set({ user: data.user, token, loading: false });
//       } else {
//         set({ loading: false });
//       }
//     } catch {
//       set({ user: null, token: null, loading: false });
//       setAuthToken(null);
//     }
//   },
// }));
