import { apiFetch, getAuthToken } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import { toastError } from "@/lib/toast";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { OnboardingData, useOnboardingStore } from "./onboardingStore";

export type Farm = {
  id: string;
  farmName: string;
  farmSize: number;
  cropTypes: string[];
  region: string;
  district: string;
  latitude?: number;
  longitude?: number;
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
  updateProfile: (profileData: Partial<OnboardingData>) => Promise<void>;
  addFarm: (farm: Omit<Farm, "id">) => Promise<void>;
  updateFarm: (farm: Farm) => Promise<void>;
  removeFarm: (id: string) => Promise<void>;
  // Restore a farm (used for Undo flows)
  restoreFarm: (farm: Farm) => void;
  reset: () => void;
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
      latitude: onboardingData.farmLocation?.latitude,
      longitude: onboardingData.farmLocation?.longitude,
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

    updateProfile: async (profileData) => {
      if (__DEV__) {
        console.debug("updateProfile called with:", profileData);
      }

      const token = getAuthToken && typeof getAuthToken === "function" ? getAuthToken() : null;
      if (!token) {
        if (__DEV__) {
          console.debug("updateProfile skipped: no auth token");
        }
        // Still update locally even without token
        set((s) => ({
          profile: { ...s.profile, ...profileData } as OnboardingData,
        }));
        // Also update onboardingStore for consistency
        useOnboardingStore.getState().updateData(profileData);
        return;
      }

      try {
        // Merge with current profile
        const currentProfile = get().profile;
        const updatedProfile = {
          ...currentProfile,
          ...profileData,
          personalInfo: {
            ...currentProfile?.personalInfo,
            ...profileData.personalInfo,
          },
          moreInfo: {
            ...currentProfile?.moreInfo,
            ...profileData.moreInfo,
          },
          location: {
            ...currentProfile?.location,
            ...profileData.location,
          },
          farmInfo: {
            ...currentProfile?.farmInfo,
            ...profileData.farmInfo,
          },
        };

        if (__DEV__) {
          console.debug("Sending profile update to backend:", updatedProfile);
        }

        // Send to backend
        const res = await apiFetch<{ profile: OnboardingData } | { queued: true }>(
          API_ENDPOINTS.FARMER_PROFILE,
          {
            method: "POST",
            body: JSON.stringify(updatedProfile),
          }
        );

        // If queued (offline), update locally
        if ((res as any)?.queued) {
          set((s) => ({
            profile: updatedProfile as OnboardingData,
          }));
          // Also update onboardingStore for consistency
          useOnboardingStore.getState().updateData(profileData);
          const { toastQueued } = await import("@/lib/toast");
          toastQueued("Queued update", "Profile update queued for upload");
          return;
        }

        // Update local state
        set({
          profile: updatedProfile as OnboardingData,
        });

        // Also update onboardingStore for consistency
        useOnboardingStore.getState().updateData(profileData);

        if (__DEV__) {
          console.debug("Profile updated successfully");
        }
      } catch (err: any) {
        console.error("Failed to update profile:", err);
        toastError("Update failed", "Failed to update profile. Try again.");
        throw err;
      }
    },

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

        // Handle backward compatibility: backend may return `name` instead of `firstName`/`lastName`
        // Map the backend response to our expected format
        const backendProfile = data.profile;
        if (backendProfile?.personalInfo) {
          const personalInfo = backendProfile.personalInfo as any;

          // If backend returns `name` but not `firstName`, try to split it
          if (personalInfo.name && !personalInfo.firstName) {
            const nameParts = personalInfo.name.trim().split(/\s+/);
            if (nameParts.length >= 2) {
              personalInfo.firstName = nameParts[0];
              personalInfo.lastName = nameParts[nameParts.length - 1];
              // If there are middle names, add them to otherNames
              if (nameParts.length > 2) {
                const middleNames = nameParts.slice(1, -1).join(" ");
                personalInfo.otherNames = personalInfo.otherNames
                  ? `${middleNames} ${personalInfo.otherNames}`
                  : middleNames;
              }
            } else {
              // Single name - use as firstName
              personalInfo.firstName = personalInfo.name;
            }
            if (__DEV__) {
              console.debug("Mapped name to firstName/lastName:", {
                original: personalInfo.name,
                firstName: personalInfo.firstName,
                lastName: personalInfo.lastName,
                otherNames: personalInfo.otherNames,
              });
            }
          }

          // Remove the legacy `name` field to prevent it from leaking into update payloads
          // The backend accepts firstName/lastName/otherNames, not the combined `name` field
          if (personalInfo.name) {
            delete personalInfo.name;
          }
        }

        // Process backend farms - ensure they have valid IDs
        // Backend farms should have real UUIDs, not farmer IDs
        const backendFarms = (data.farms || []).map((farm: any) => ({
          id: farm.id,
          farmName: farm.farmName || farm.farm_name || farm.name || "",
          farmSize: farm.farmSize || farm.farm_size || farm.size || 0,
          cropTypes: farm.cropTypes || farm.crop_types || [],
          region: farm.region || "Unknown Region",
          district: farm.district || "Unknown District",
          latitude: farm.latitude ?? farm.location?.latitude ?? farm.lat ?? data.profile?.farmLocation?.latitude ?? undefined,
          longitude: farm.longitude ?? farm.location?.longitude ?? farm.lng ?? data.profile?.farmLocation?.longitude ?? undefined,
        }));

        if (__DEV__) {
          console.debug("Processed backend farms:", backendFarms);
        }

        // Check if backend has a farm that matches the profile's farmInfo (synced onboarding farm)
        const profileFarmName = data.profile?.farmInfo?.farmName?.toLowerCase();
        const syncedOnboardingFarm = profileFarmName
          ? backendFarms.find((f: Farm) => f.farmName.toLowerCase() === profileFarmName)
          : null;

        // If the onboarding farm has been synced to backend (has real UUID), use that
        // Otherwise, create a local placeholder from profile.farmInfo
        let finalFarms: Farm[] = [];

        if (syncedOnboardingFarm) {
          // Backend has the onboarding farm with a real UUID - use backend farms directly
          // The synced farm already has region/district from backend, so use it as-is
          if (__DEV__) {
            console.debug("Onboarding farm synced to backend with ID:", syncedOnboardingFarm.id);
          }
          finalFarms = backendFarms;
        } else {
          // Onboarding farm not yet synced - create a local placeholder
          const backendOnboardingFarmInfo = data.profile?.farmInfo;
          const localOnboardingFarm: Farm | null = backendOnboardingFarmInfo?.farmName
            ? {
              id: "onboarding-farm",
              farmName: backendOnboardingFarmInfo.farmName || "",
              farmSize: backendOnboardingFarmInfo.farmSize || 0,
              cropTypes: backendOnboardingFarmInfo.cropTypes || [],
              region: data.profile?.location?.region || "Unknown Region",
              district: data.profile?.location?.district || "Unknown District",
              latitude: data.profile?.farmLocation?.latitude,
              longitude: data.profile?.farmLocation?.longitude,
            }
            : null;

          // Combine local placeholder with backend farms (no duplicates since onboarding not synced)
          finalFarms = [
            ...(localOnboardingFarm ? [localOnboardingFarm] : []),
            ...backendFarms,
          ];
        }

        // Remove duplicates by ID (keep first occurrence) - defensive
        const uniqueFarms = finalFarms.filter(
          (v, i, a) => a.findIndex((f) => f.id === v.id) === i
        );

        if (__DEV__) {
          console.debug("Final unique farms:", uniqueFarms.map(f => ({ id: f.id, name: f.farmName })));
        }

        set({
          profile: backendProfile || onboardingData || null,
          farms: uniqueFarms,
          loading: false,
        });

        // Sync backend profile data to onboardingStore for consistency
        // This ensures components using onboardingStore also have the latest data
        if (backendProfile) {
          const onboardingStore = useOnboardingStore.getState();
          onboardingStore.updateData(backendProfile);

          // Also persist to SecureStore so loadFromStorage doesn't overwrite with stale data
          try {
            const updatedData = useOnboardingStore.getState().data;
            await SecureStore.setItemAsync("onboardingData", JSON.stringify(updatedData));
            if (__DEV__) {
              console.debug("Synced backend profile to onboardingStore and persisted to SecureStore");
            }
          } catch (persistErr) {
            console.warn("Failed to persist synced profile to SecureStore:", persistErr);
          }
        }
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

    updateFarm: async (farm) => {
      if (__DEV__) {
        console.debug("updateFarm called with:", farm);
      }

      // Check if this is the onboarding farm (embedded in profile)
      const isOnboardingFarm = farm.id === "onboarding-farm";
      // Check if this is a local-only queued farm
      const isLocalQueuedFarm = farm.id.startsWith("local-farm-");
      const isUUID = farm.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

      // Handle onboarding farm - update via profile endpoint
      if (isOnboardingFarm) {
        if (__DEV__) {
          console.debug("Updating onboarding farm via profile endpoint:", farm);
        }

        try {
          // Get current profile to merge with updated farm data
          const currentProfile = get().profile;

          // Build updated profile payload with new farm info and location
          const updatedProfile = {
            ...currentProfile,
            farmInfo: {
              ...currentProfile?.farmInfo,
              farmName: farm.farmName,
              farmSize: farm.farmSize,
              cropTypes: farm.cropTypes,
            },
            location: {
              ...currentProfile?.location,
              region: farm.region,
              district: farm.district,
              latitude: farm.latitude,
              longitude: farm.longitude,
            },
          };

          if (__DEV__) {
            console.debug("Sending profile update:", updatedProfile);
          }

          // Update profile on backend (POST is used for both create and update)
          const res = await apiFetch<{ profile: OnboardingData } | { queued: true }>(
            API_ENDPOINTS.FARMER_PROFILE,
            {
              method: "POST",
              body: JSON.stringify(updatedProfile),
            }
          );

          // If queued, update optimistically
          if ((res as any)?.queued) {
            set((s) => ({
              profile: updatedProfile as OnboardingData,
              farms: s.farms.map((f) =>
                f.id === farm.id ? { ...farm, _queued: true } as any : f
              ),
            }));
            const { toastQueued } = await import("@/lib/toast");
            toastQueued("Queued update", "Farm update queued for upload");
            return;
          }

          // Update local state temporarily
          set((s) => ({
            profile: updatedProfile as OnboardingData,
            farms: s.farms.map((f) => (f.id === farm.id ? farm : f)),
          }));

          if (__DEV__) {
            console.debug("Onboarding farm updated successfully, refetching to get real UUID");
          }

          // Refetch profile to get the real farm UUID from backend
          // The backend creates/updates the farm in the database and returns it with a real ID
          await get().fetchProfile();
          return;
        } catch (err: any) {
          console.error("Failed to update onboarding farm via profile", err);
          toastError("Update failed", "Failed to update farm. Try again.");
          throw err;
        }
      }

      // Handle local queued farms - just update locally
      if (isLocalQueuedFarm || !isUUID) {
        if (__DEV__) {
          console.debug("Updating local/queued farm without API call:", farm.id);
        }
        set((s) => ({
          farms: s.farms.map((f) => (f.id === farm.id ? farm : f)),
        }));
        return;
      }

      try {
        const res = await apiFetch<Farm | { queued: true }>(
          API_ENDPOINTS.FARMER_FARMS + `/${farm.id}`,
          {
            method: "PUT",
            body: JSON.stringify({
              farmName: farm.farmName,
              farmSize: farm.farmSize,
              region: farm.region,
              district: farm.district,
              cropTypes: farm.cropTypes,
              latitude: farm.latitude,
              longitude: farm.longitude,
            }),
          }
        );

        // If queued, update optimistically
        if ((res as any)?.queued) {
          set((s) => ({
            farms: s.farms.map((f) =>
              f.id === farm.id ? { ...farm, _queued: true } as any : f
            ),
          }));
          const { toastQueued } = await import("@/lib/toast");
          toastQueued("Queued update", "Farm update queued for upload");
          return;
        }

        // Update local state with response
        set((s) => ({
          farms: s.farms.map((f) => (f.id === farm.id ? (res as Farm) : f)),
        }));
      } catch (err: any) {
        console.error("Failed to update farm", err);
        toastError("Update failed", "Failed to update farm. Try again.");
        throw err;
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
    reset: () => set({ profile: null, farms: [], selectedFarmId: null, selectedCrop: null, error: null }),
  };
});
