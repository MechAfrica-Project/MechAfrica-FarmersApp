// stores/farmerStore.ts
import { create } from "zustand";
import { apiFetch } from "@/lib/api";
import { OnboardingData } from "./onboardingStore";

export type Farm = {
  id: string;
  farmName: string;
  farmSize: number;
  cropTypes: string[];
  region: string;
  district: string;
};

interface FarmerState {
  profile: OnboardingData | null;
  farms: Farm[];
  loading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  addFarm: (farm: Omit<Farm, "id">) => void;
  removeFarm: (id: string) => void;
}

export const useFarmerStore = create<FarmerState>((set, get) => ({
  profile: null,
  farms: [],
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<{ profile: OnboardingData; farms: Farm[] }>(
        "/farmer/profile"
      );

      // profile still single farm from onboarding
      set({
        profile: data.profile ?? null,
        farms:
          data.farms ??
          (data.profile?.farmInfo
            ? [
                {
                  id: "onboarding-farm",
                  farmName: data.profile.farmInfo.farmName ?? "",
                  farmSize: data.profile.farmInfo.farmSize ?? 0,
                  cropTypes: data.profile.farmInfo.cropTypes ?? [],
                  region: data.profile.location?.region ?? "Unknown Region",
                  district:
                    data.profile.location?.district ?? "Unknown District",
                },
              ]
            : []),

        loading: false,
      });
    } catch (err: any) {
      set({ error: err?.message ?? "Failed to fetch profile", loading: false });
    }
  },

  addFarm: (farm) => {
    const newFarm: Farm = { id: Date.now().toString(), ...farm };
    set((s) => ({ farms: [...s.farms, newFarm] }));
  },

  removeFarm: (id) =>
    set((s) => ({ farms: s.farms.filter((f) => f.id !== id) })),
}));
