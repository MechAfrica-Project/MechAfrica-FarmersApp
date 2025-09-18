// stores/authStore.ts
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { setAuthToken, apiFetch } from "@/lib/api";
import { router } from "expo-router";
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // optional, for profile picture
}

interface LoginResponse {
  user: User;
  token: string;
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
  logout: () => Promise<void>;
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
      // hit backend to request OTP
      await apiFetch("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ phone: phone?.raw }),
      });
      set({ loading: false });
      router.push("/(auth)/login/verifyPhone");
    } catch (err: any) {
      set({ error: err?.message ?? "Network error", loading: false });
    }
  },

  verifyOtp: async (code) => {
    set({ loading: true, error: null });
    try {
      const { phone } = get();
      if (!phone?.valid) throw new Error("No valid phone set");

      // ✅ expect structured response
      const data = await apiFetch<LoginResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone: phone?.raw, code }),
      });

      await SecureStore.setItemAsync("token", data.token);
      setAuthToken(data.token);

      set({ user: data.user, token: data.token, loading: false });
      router.replace("/(tabs)");
      return true;
    } catch (err: any) {
      set({ error: err?.message ?? "Verification failed", loading: false });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    setAuthToken(null);
    set({ user: null, token: null });
    router.replace("/(auth)/login/signIn");
  },

  restoreSession: async () => {
    set({ loading: true });
    try {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        setAuthToken(token);
        // ✅ fetch current user from backend
        const me = await apiFetch<User>("/auth/me");
        set({ user: me, token, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      set({ user: null, token: null, loading: false });
      setAuthToken(null);
    }
  },
}));
