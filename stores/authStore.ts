// stores/authStore.ts
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";
import { setAuthToken } from "@/lib/api";
import useDebugStore from "@/stores/debugStore";
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

    // ⛔️ Skipping backend for now
    // await apiFetch("/auth/send-otp", { ... });

    // ✅ Simulate sending OTP
    set({ loading: false });
    router.push("/(auth)/login/verifyPhone");
  },

  verifyOtp: async (code) => {
    set({ loading: true, error: null });
    try {
      const { phone } = get();
      if (!phone?.valid) throw new Error("No valid phone set");

      // ⛔ Skipping backend for now
      // const data = await apiFetch<LoginResponse>("/auth/verify-otp", { ... });

      // ✅ Ensure onboarding is loaded from storage
      const onboardingStore = useOnboardingStore.getState();
      await onboardingStore.loadFromStorage();
      const onboarding = onboardingStore.data;

      if (!onboarding.personalInfo?.name) {
        set({ error: "No onboarding data found", loading: false });
        return false;
      }

      const fakeUser: User = {
        id: Date.now().toString(),
        name: onboarding.personalInfo.name,
        phone: onboarding.personalInfo.phone?.raw,
        avatar: onboarding.profilePicture,
      };

      const fakeToken = "local-token-" + fakeUser.id;

      await SecureStore.setItemAsync("token", fakeToken);
      setAuthToken(fakeToken);

      set({ user: fakeUser, token: fakeToken, loading: false });
      router.replace("/(tabs)");
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? "Verification failed", loading: false });
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
         
        console.debug("logout(dev): captured router state", state);
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
      const token = await SecureStore.getItemAsync("token");
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
