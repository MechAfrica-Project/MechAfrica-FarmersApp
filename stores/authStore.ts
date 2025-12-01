// stores/authStore.ts
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";
import { apiFetch, setAuthToken, setTokens } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toastError } from '@/lib/toast';
import { useDebugStore } from "@/stores/debugStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  phone: PhoneValue | null;
  loading: boolean;
  error: string | null;

  setPhone: (val: PhoneValue) => void;
  sendPhone: () => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: (mode?: "dev" | "prod") => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  phone: null,
  loading: false,
  error: null,

  setPhone: (val) => set({ phone: val, error: null }),

  sendPhone: async () => {
    const { phone } = get();
    if (!phone?.valid) {
      set({ error: "Enter a valid phone number" });
      return;
    }

    set({ loading: true, error: null });
    try {
      await apiFetch<{ ok: boolean }>(API_ENDPOINTS.AUTH_SEND_OTP, {
        method: "POST",
        body: JSON.stringify({ phone: phone?.raw, country: phone?.country }),
      });

      // If API succeeded, navigate to verify screen
      set({ loading: false });
      router.push("/(auth)/login/verifyPhone");
    } catch (err: any) {
      const msg = err?.message ?? "Failed to send code";
      toastError('Send failed', msg);
      set({ loading: false, error: msg });
    }
  },

  verifyOtp: async (code) => {
    set({ loading: true, error: null });
    try {
      const { phone } = get();
      if (!phone?.valid) throw new Error("No valid phone set");

      // Call backend to verify OTP and receive token + user
      const data = await apiFetch<any>(
        API_ENDPOINTS.AUTH_VERIFY_OTP,
        {
          method: "POST",
          body: JSON.stringify({ phone: phone.raw, code }),
        }
      );

      // Temporary debug: log the shape of the verification response (sanitized)
      try {
        const sanitize = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          const copy: any = Array.isArray(obj) ? [] : {};
          for (const k of Object.keys(obj)) {
            const v = (obj as any)[k];
            if (/token|access|refresh/i.test(k) && typeof v === 'string') {
              // mask tokens to avoid leaking secrets in logs
              copy[k] = v.length > 8 ? `${v.slice(0,4)}...${v.slice(-4)}` : '***';
            } else if (typeof v === 'object') {
              copy[k] = sanitize(v);
            } else {
              copy[k] = v;
            }
          }
          return copy;
        };
        if (__DEV__) {
          console.debug('[auth] verifyOtp response (sanitized):', sanitize(data));
        }
      } catch {}

      // Accept multiple possible token property names returned by different backends
      const newToken: string | null = data?.token ?? data?.accessToken ?? data?.access_token ?? null;
      const newRefresh: string | null = (data as any)?.refreshToken ?? (data as any)?.refresh_token ?? null;

      if (!newToken) {
        // Provide more context in the error while still masking sensitive fields
        const respSummary = (() => {
          try {
            const keys = data && typeof data === 'object' ? Object.keys(data).join(',') : String(data);
            return `response keys: ${keys}`;
          } catch { return 'response unavailable'; }
        })();
        throw new Error(`Invalid verification response: missing token (${respSummary})`);
      }

      // Persist token to both SecureStore (legacy) and unified token storage
      try { await SecureStore.setItemAsync("token", newToken); } catch {}
      // Persist using new setTokens (will save to AsyncStorage and in-memory)
      try { await setTokens(newToken, newRefresh ?? null); } catch {}
      // Keep backwards-compatible in-memory token setter
      setAuthToken(newToken);

      // Ensure onboarding store is loaded (some flows rely on it)
      const onboardingStore = useOnboardingStore.getState();
      await onboardingStore.loadFromStorage();

      set({ user: data.user ?? null, token: data.token, loading: false });

      // After successful verification, kick off background synces (non-blocking)
      try {
        const rs = (await import("@/stores/requestsStore")).useRequestsStore.getState();
        const fs = (await import("@/stores/farmerStore")).useFarmerStore.getState();
        const ns = (await import("@/stores/notificationStore")).useNotificationStore.getState();
        Promise.allSettled([
          rs.fetchRequests ? rs.fetchRequests() : Promise.resolve(),
          fs.fetchProfile ? fs.fetchProfile() : Promise.resolve(),
          ns.fetchNotifications ? ns.fetchNotifications() : Promise.resolve(),
        ]).catch(() => {});
      } catch {}

      router.replace("/(tabs)");
      return true;
    } catch (err: any) {
      const msg = err?.message ?? "Verification failed";
      toastError('Verification failed', msg);
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: async (mode: "dev" | "prod" = "prod") => {
    // Remove persisted token first
    try {
      await SecureStore.deleteItemAsync("token");
    } catch {}
    setAuthToken(null);
    set({ user: null, token: null });

    if (mode === "dev") {
      // Dev: show sign-in and capture router state to debug store
      try {
        router.replace("/(auth)/login/signIn");
      } catch {
        try {
          router.replace("/");
          router.push("/(auth)/login/signIn");
        } catch {
          try {
            router.replace("/(auth)/login/signIn");
          } catch {}
        }
      }

      try {
         
        const anyRouter: any = router as any;
        const maybeGetState = anyRouter.getState || anyRouter.getRootState || anyRouter.getInitialState;
        const state = typeof maybeGetState === "function" ? maybeGetState() : undefined;
        useDebugStore.getState().setLastRouterState(state ?? { note: "router.getState() unavailable" });
         
        if (__DEV__) {
          console.debug("logout(dev): captured router state", state);
        }
      } catch {}
    } else {
      // Prod: conservative navigation to sign-in and index as previous route
      try {
        router.replace("/");
        router.push("/(auth)/login/signIn");
      } catch {
        try {
          router.replace("/(auth)/login/signIn");
        } catch {}
      }
    }
  },

  restoreSession: async () => {
    set({ loading: true });
    try {
      // Prefer the token already loaded into api client memory, fall back to SecureStore
      const { getAuthToken } = await import('@/lib/api');
      let token = getAuthToken();
      if (!token) token = await SecureStore.getItemAsync("token");
      if (token) {
        setAuthToken(token);

        // ✅ Ensure onboarding is loaded before using
        const onboardingStore = useOnboardingStore.getState();
        await onboardingStore.loadFromStorage();
        const onboarding = onboardingStore.data;

        if (onboarding.personalInfo?.name) {
          set({
            user: {
              id: "local",
              name: onboarding.personalInfo.name,
              phone: onboarding.personalInfo.phone?.raw,
              avatar: onboarding.profilePicture,
            },
            token,
            loading: false,
          });
        } else {
          set({ loading: false });
        }
      } else {
        set({ loading: false });
      }
    } catch {
      set({ user: null, token: null, loading: false });
      setAuthToken(null);
    }
  },
}));
