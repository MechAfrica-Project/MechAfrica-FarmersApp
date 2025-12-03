import { apiFetch, getAuthToken } from "@/lib/api";
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
  addFarm: (farm: Omit<Farm, "id">) => Promise<void>;
  removeFarm: (id: string) => Promise<void>;
  // Restore a farm (used for Undo flows)
  restoreFarm: (farm: Farm) => void;
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
        // If there's no auth token available, skip calling protected endpoint.
        // This prevents noisy console warnings when unauthenticated users visit
        // profile screens (the UI already falls back to local onboarding data).
        const token = getAuthToken && typeof getAuthToken === 'function' ? getAuthToken() : null;
        if (!token) {
          set({ loading: false });
          if (__DEV__) {
            console.debug('fetchProfile skipped: no auth token');
          }
          return;
        }
        const data = await apiFetch<{ profile: OnboardingData; farms: Farm[] }>(
          API_ENDPOINTS.FARMER_PROFILE
        );

        // Debug: Log raw backend response
        if (__DEV__) {
          console.debug("fetchProfile response:", JSON.stringify(data, null, 2));
        }

        // Convert onboarding farm from backend profile
        const backendOnboardingFarmInfo = data.profile?.farmInfo;
        const backendOnboardingFarm: Farm[] = backendOnboardingFarmInfo?.farmName
          ? [
            {
              // Always use "onboarding-farm" as ID for profile-embedded farm data
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

        // Process backend farms - ensure they have valid IDs
        // Backend farms should have real UUIDs, not farmer IDs
        const backendFarms = (data.farms || []).map((farm: any) => ({
          id: farm.id,
          farmName: farm.farmName || farm.farm_name || farm.name || "",
          farmSize: farm.farmSize || farm.farm_size || farm.size || 0,
          cropTypes: farm.cropTypes || farm.crop_types || [],
          region: farm.region || "Unknown Region",
          district: farm.district || "Unknown District",
        }));

        if (__DEV__) {
          console.debug("Processed backend farms:", backendFarms);
        }

        // Check if backend farms duplicate the profile-embedded farm (same name)
        // This handles the case where backend returns both profile.farmInfo AND farms[] with same data
        const profileFarmName = backendOnboardingFarmInfo?.farmName?.toLowerCase();
        const filteredBackendFarms = profileFarmName
          ? backendFarms.filter((f: Farm) => f.farmName.toLowerCase() !== profileFarmName)
          : backendFarms;

        // Merge: local onboarding farm + backend onboarding farm + non-duplicate backend farms
        const allFarms = [
          ...(onboardingFarm ? [onboardingFarm] : []),
          ...backendOnboardingFarm,
          ...filteredBackendFarms,
        ];

        // Remove duplicates by ID (keep first occurrence)
        const uniqueFarms = allFarms.filter(
          (v, i, a) => a.findIndex((f) => f.id === v.id) === i
        );

        if (__DEV__) {
          console.debug("Final unique farms:", uniqueFarms.map(f => ({ id: f.id, name: f.farmName })));
        }

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
      if (__DEV__) {
        console.debug("removeFarm called with id:", id);
      }

      // Check if this is a local-only farm (not synced to backend)
      // Local farms have IDs like "onboarding-farm" or "local-farm-xxx"
      const isLocalFarm = id === "onboarding-farm" || id.startsWith("local-farm-");

      // Also check if the farm exists in our local state - if not found on backend, treat as local
      const farmInState = get().farms.find((f) => f.id === id);
      const isProfileEmbeddedFarm = farmInState && !farmInState.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      if (isLocalFarm || isProfileEmbeddedFarm) {
        if (__DEV__) {
          console.debug("Removing local/embedded farm without API call:", id);
        }
        // Just remove locally without calling the backend
        set((s) => ({ farms: s.farms.filter((f) => f.id !== id) }));
        return;
      }

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
