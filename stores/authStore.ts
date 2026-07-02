// stores/authStore.ts
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";
import { COUNTRIES } from "@/constants/countries";
import { apiFetch, clearTokens, loadTokensFromStorage, setAuthToken, setTokens } from "@/lib/api";
import { getNormalizedPhone } from "@/utils/normalizePhone";
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
  // Timestamp (ms) until which sending an OTP should be disabled because of server rate limits
  otpCooldownUntil: number | null;

  setOtpCooldown: (until: number | null) => void;

  setPhone: (val: PhoneValue) => void;
  sendPhone: (options?: { skipNavigation?: boolean }) => Promise<void>;
  verifyOtp: (code: string, options?: { skipNavigation?: boolean }) => Promise<boolean>;
  logout: (mode?: "dev" | "prod") => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  phone: null,
  loading: false,
  error: null,
  otpCooldownUntil: null,

  setPhone: (val) => set({ phone: val, error: null }),

  sendPhone: async (options) => {
    const { phone } = get();
    if (!phone?.valid) {
      set({ error: "Enter a valid phone number" });
      return;
    }

    const normalizedPhone = getNormalizedPhone(phone);

    set({ loading: true, error: null });
    try {
      const payload = {
        Phone: normalizedPhone,
        phone_number: normalizedPhone,
        phone: normalizedPhone,
      };
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        try { console.debug('[auth] sendPhone payload:', payload); } catch { }
      }
      await apiFetch<any>(API_ENDPOINTS.AUTH_SEND_OTP, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // On success, set a short local cooldown to avoid immediate resend spam
      const now = Date.now();
      const shortCooldownMs = 30 * 1000; // 30s frontend cooldown
      set({ otpCooldownUntil: now + shortCooldownMs });

      // If API succeeded, navigate to verify screen unless suppressed
      set({ loading: false });
      if (!options?.skipNavigation) {
        router.push("/(auth)/login/verifyPhone");
      }
    } catch (err: any) {
      // Try to extract a useful message from the thrown error and detect rate-limits
      let msg = err?.message || "Failed to send code";
      if (msg.includes("Too Many Requests")) {
        msg = "Too many attempts. Please wait a moment and try again.";
      }
      try {
        if (err?.body) {
          const bodyObj = typeof err.body === 'string' ? JSON.parse(err.body || '{}') : err.body;
          const bodyStr = typeof err.body === 'string' ? err.body : JSON.stringify(err.body);
          msg = `${msg} — ${bodyStr}`;

          // detect OTP rate limit
          const code = bodyObj?.code ?? bodyObj?.errorCode ?? null;
          const debug = bodyObj?.debug ?? '';
          let retrySecs: number | null = null;
          if (bodyObj?.retry_after) retrySecs = Number(bodyObj.retry_after);
          if (!retrySecs && bodyObj?.retryAfter) retrySecs = Number(bodyObj.retryAfter);

          if (code === 'OTP_SEND_FAILED' || /too many otp requests|too many requests/i.test(debug || '')) {
            // Force a client-side 60 second retry regardless of server-provided retry_after.
            // This intentionally ignores server retry_after to reduce user friction.
            retrySecs = 60;
            const until = Date.now() + (retrySecs * 1000);
            set({ otpCooldownUntil: until });
            msg = `${bodyObj?.message ?? 'Failed to send OTP. Please try again.'} Try again in ${Math.ceil(retrySecs / 60)} minute(s).`;
          }
        }
      } catch { }
      toastError('Send failed', msg);
      set({ loading: false, error: msg });
      // rethrow so callers who `await sendPhone()` can react if needed
      throw err;
    }
  },

  setOtpCooldown: (until) => set({ otpCooldownUntil: until }),

  verifyOtp: async (code, options) => {
    // Debug: log the OTP code length being sent
    if (__DEV__) {
      console.debug('[auth] verifyOtp called with code length:', code?.length, 'code:', code);
    }

    // Validate OTP code length before sending to backend
    if (!code || code.length < 6) {
      const msg = `Invalid OTP code length: ${code?.length || 0}. Please enter all 6 digits.`;
      if (__DEV__) {
        console.warn('[auth] verifyOtp rejected:', msg);
      }
      set({ error: msg, loading: false });
      return false;
    }

    set({ loading: true, error: null });
    try {
      const { phone } = get();
      if (!phone?.valid) throw new Error("No valid phone set");

      // Call backend to verify OTP and receive token + user
      const normalizedPhone = getNormalizedPhone(phone);

      // Ensure code is exactly 6 digits (trim any whitespace)
      const cleanCode = code.trim();
      if (cleanCode.length !== 6) {
        throw new Error(`OTP must be exactly 6 digits, got ${cleanCode.length}`);
      }

      const payload = {
        Phone: normalizedPhone,
        phone_number: normalizedPhone,
        phone: normalizedPhone,
        OTP: cleanCode,
        otp: cleanCode,
        code: cleanCode,
        verification_code: cleanCode,
        role: "farmer",
      };

      if (__DEV__) {
        console.debug('[auth] verifyOtp sending payload:', { ...payload, OTP: '******' });
      }

      const raw = await apiFetch<any>(
        API_ENDPOINTS.AUTH_VERIFY_OTP,
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      // Some backends nest data under `data`
      const data = (raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw) ?? raw;

      // Temporary debug: log the shape of the verification response (sanitized)
      try {
        const sanitize = (obj: any) => {
          if (!obj || typeof obj !== 'object') return obj;
          const copy: any = Array.isArray(obj) ? [] : {};
          for (const k of Object.keys(obj)) {
            const v = (obj as any)[k];
            if (/token|access|refresh/i.test(k) && typeof v === 'string') {
              // mask tokens to avoid leaking secrets in logs
              copy[k] = v.length > 8 ? `${v.slice(0, 4)}...${v.slice(-4)}` : '***';
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
      } catch { }

      // Accept multiple possible token property names / nesting returned by different backends
      const newToken: string | null =
        data?.token ??
        data?.accessToken ??
        data?.access_token ??
        (data as any)?.data?.token ??
        null;
      const newRefresh: string | null =
        (data as any)?.refreshToken ??
        (data as any)?.refresh_token ??
        (data as any)?.data?.refresh_token ??
        null;

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

      // Persist using new setTokens (will save to SecureStore and in-memory)
      try { await setTokens(newToken, newRefresh ?? null); } catch { }
      // Keep backwards-compatible in-memory token setter
      setAuthToken(newToken);

      // Ensure onboarding store is loaded (some flows rely on it)
      const onboardingStore = useOnboardingStore.getState();
      await onboardingStore.loadFromStorage();

      set({ user: data.user ?? null, token: newToken, loading: false });

      // After successful verification, kick off background synces (non-blocking)
      try {
        const rs = (await import("@/stores/requestsStore")).useRequestsStore.getState();
        const fs = (await import("@/stores/farmerStore")).useFarmerStore.getState();
        const ns = (await import("@/stores/notificationStore")).useNotificationStore.getState();
        Promise.allSettled([
          rs.fetchRequests ? rs.fetchRequests() : Promise.resolve(),
          fs.fetchProfile ? fs.fetchProfile() : Promise.resolve(),
          ns.fetchNotifications ? ns.fetchNotifications() : Promise.resolve(),
        ]).catch(() => { });
      } catch { }

      if (!options?.skipNavigation) {
        router.replace("/(tabs)");
      }
      return true;
    } catch (err: any) {
      const msg = err?.message || "Verification failed";
      toastError('Verification failed', msg);
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: async (mode: "dev" | "prod" = "prod") => {
    // Unregister push notifications
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { unregisterPushToken } = require('@/lib/pushNotifications');
      await unregisterPushToken();
    } catch { }

    // Remove persisted token first
    try {
      await clearTokens();
      await SecureStore.deleteItemAsync("token"); // Legacy clear
    } catch { }
    setAuthToken(null);
    set({ user: null, token: null });

    // Clear all other stores
    try {
      (await import("@/stores/farmerStore")).useFarmerStore.getState().reset?.();
      (await import("@/stores/requestsStore")).useRequestsStore.getState().reset?.();
      (await import("@/stores/notificationStore")).useNotificationStore.getState().clear?.();
    } catch { }

    if (mode === "dev") {
      // Dev: show sign-in and capture router state to debug store
      setTimeout(() => {
        try { router.dismissAll(); router.replace("/(auth)/login/signIn"); } catch { }
      }, 0);

      try {
        const anyRouter: any = router as any;
        const maybeGetState = anyRouter.getState || anyRouter.getRootState || anyRouter.getInitialState;
        const state = typeof maybeGetState === "function" ? maybeGetState() : undefined;
        useDebugStore.getState().setLastRouterState(state ?? { note: "router.getState() unavailable" });

        if (__DEV__) {
          console.debug("logout(dev): captured router state", state);
        }
      } catch { }
    } else {
      // Prod: conservative navigation to sign-in and index as previous route
      setTimeout(() => {
        try { router.dismissAll(); router.replace("/(auth)/login/signIn"); } catch { }
      }, 0);
    }
  },

  restoreSession: async () => {
    set({ loading: true });
    try {
      // Prefer the token already loaded into api client memory, fall back to SecureStore
      const { getAuthToken } = await import('@/lib/api');
      await loadTokensFromStorage();
      let token = getAuthToken();
      if (!token) token = await SecureStore.getItemAsync("token"); // Legacy fallback
      if (token) {
        setAuthToken(token);

        // ✅ Optionally try to pre-fill user display data from onboarding if available
        let userData: any = { id: "authenticated_user" };
        try {
          const onboardingStore = useOnboardingStore.getState();
          await onboardingStore.loadFromStorage();
          const onboarding = onboardingStore.data;

          if (onboarding?.personalInfo?.firstName) {
            userData = {
              id: "local",
              name: `${onboarding.personalInfo.firstName} ${onboarding.personalInfo.lastName ?? ''}`.trim(),
              phone: onboarding.personalInfo.phone?.raw,
              avatar: onboarding.profilePicture,
            };
          }
        } catch {}

        set({
          user: userData,
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
