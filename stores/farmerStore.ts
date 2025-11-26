import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toastError } from "@/lib/toast";
import { create } from "zustand";
import { OnboardingData, useOnboardingStore } from "./onboardingStore";

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
  selectedFarmId?: string | null;
  selectedCrop?: string | null;

  setSelectedFarm: (id?: string | null) => void;
  setSelectedCrop: (crop?: string | null) => void;

  fetchProfile: () => Promise<void>;
  addFarm: (farm: Omit<Farm, "id">) => void;
  removeFarm: (id: string) => void;
}

export const useFarmerStore = create<FarmerState>((set, get) => {
  // Pre-fill with onboarding farm from local onboardingStore
  const onboardingData = useOnboardingStore.getState().data;
  const onboardingFarm: Farm | null = onboardingData.farmInfo?.farmName
    ? {
        id: "onboarding-farm",
        farmName: onboardingData.farmInfo.farmName,
        farmSize: onboardingData.farmInfo.farmSize || 0,
        cropTypes: onboardingData.farmInfo.cropTypes || [],
        region: onboardingData.location?.region || "Unknown Region",
        district: onboardingData.location?.district || "Unknown District",
      }
    : null;

  const initialFarms = onboardingFarm ? [onboardingFarm] : [];

  return {
    profile: onboardingData || null,
    farms: initialFarms,
    selectedFarmId: initialFarms[0]?.id ?? null,
    selectedCrop: initialFarms[0]?.cropTypes?.[0] ?? null,
    loading: false,
    error: null,

    setSelectedFarm: (id) => set(() => ({ selectedFarmId: id ?? null })),
    setSelectedCrop: (crop) => set(() => ({ selectedCrop: crop ?? null })),

    fetchProfile: async () => {
      set({ loading: true, error: null });
      try {
        const data = await apiFetch<{ profile: OnboardingData; farms: Farm[] }>(
          API_ENDPOINTS.FARMER_PROFILE
        );

        // Convert onboarding farm from backend profile
        const backendOnboardingFarmInfo = data.profile?.farmInfo;
        const backendOnboardingFarm: Farm[] = backendOnboardingFarmInfo
          ? [
              {
                id: "onboarding-farm",
                farmName: backendOnboardingFarmInfo.farmName || "",
                farmSize: backendOnboardingFarmInfo.farmSize || 0,
                cropTypes: backendOnboardingFarmInfo.cropTypes || [],
                region: data.profile?.location?.region || "Unknown Region",
                district:
                  data.profile?.location?.district || "Unknown District",
              },
            ]
          : [];

        // Merge backend farms + onboarding farm + local onboarding farm
        const allFarms = [
          ...(onboardingFarm ? [onboardingFarm] : []),
          ...backendOnboardingFarm,
          ...(data.farms || []),
        ];

        // Remove duplicates by ID
        const uniqueFarms = allFarms.filter(
          (v, i, a) => a.findIndex((f) => f.id === v.id) === i
        );

        set({
          profile: data.profile || onboardingData || null,
          farms: uniqueFarms,
          loading: false,
        });
      } catch (err: any) {
        console.warn(
          "Failed to fetch profile; using local onboarding farm",
          err
        );
        set({
          error: err?.message || "Failed to fetch profile",
          loading: false,
        });
      }
    },

    addFarm: async (farm) => {
      try {
        const savedFarm = await apiFetch<Farm | { queued: true; queuedId: string }>(
          API_ENDPOINTS.FARMER_FARMS,
          {
            method: "POST",
            body: JSON.stringify(farm),
          }
        );

        if ((savedFarm as any)?.queued) {
          // create a local placeholder farm marked as queued
          const id = `local-farm-${Date.now()}`;
          const local: any = { id, ...farm, _queued: true, _queuedId: (savedFarm as any).queuedId };
          set((s) => ({ farms: [...s.farms, local] }));
          const { toastQueued } = await import('@/lib/toast');
          toastQueued("Saved offline", "Farm queued for upload");
          return;
        }

        set((s) => ({ farms: [...s.farms, savedFarm as Farm] }));
      } catch (err: any) {
        console.error("Failed to add farm", err);
        toastError('Save failed', 'Failed to save farm. Try again.');
      }
    },

    removeFarm: async (id) => {
      try {
        const res = await apiFetch(API_ENDPOINTS.FARMER_FARMS + `/${id}`, { method: "DELETE" });
        // if queued, optimistically remove locally and notify
        if ((res as any)?.queued) {
          set((s) => ({ farms: s.farms.filter((f) => f.id !== id) }));
          const { toastQueued } = await import('@/lib/toast');
          toastQueued("Queued delete", "Farm deletion queued for upload");
          return;
        }

        set((s) => ({ farms: s.farms.filter((f) => f.id !== id) }));
      } catch (err: any) {
        console.error("Failed to remove farm", err);
        toastError('Delete failed', 'Failed to delete farm. Try again.');
      }
    },
    // Restore a farm (used for Undo actions in the UI)
    restoreFarm: (farm: Farm) =>
      set((s) => {
        if (s.farms.find((f) => f.id === farm.id)) return { farms: s.farms };
        return { farms: [...s.farms, farm] };
      }),
  };
});
