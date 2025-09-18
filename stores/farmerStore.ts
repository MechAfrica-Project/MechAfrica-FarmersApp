// stores/farmerStore.ts
import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { OnboardingData } from "./onboardingStore";

interface FarmerState {
  profile: OnboardingData | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
}

export const useFarmerStore = create<FarmerState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<{ profile: OnboardingData }>("/farmer/profile");
      set({ profile: data.profile ?? null, loading: false });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch profile", loading: false });
    }
  },
}));
