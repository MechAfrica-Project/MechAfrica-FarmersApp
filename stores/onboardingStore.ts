// stores/onboardingStore.ts
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

/**
 * Onboarding data shape
 */

export type OnboardingData = {
  language?: string;
  personalInfo: {
    firstName?: string;
    lastName?: string;
    otherNames?: string;
    phone?: PhoneValue;
    otpVerified?: boolean;
  };
  moreInfo: {
    gender?: "Male" | "Female";
    age?: number;
    dob?: string;
  };

  location: { region?: string; district?: string };
  profilePicture?: string;
  farmLocation?: {
    latitude: number;
    longitude: number;
  };
  farmInfo: {
    farmName?: string;
    farmSize?: number;
    farmSizeRaw?: string; // keep the user's typed string
    cropTypes?: string[];
  };
};

type ValidateResult = { valid: boolean; message?: string };

type OnboardingState = {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (n: number) => void;

  updateData: (patch: Partial<OnboardingData>) => void;
  reset: () => void;

  /** validate a specific step (0-indexed) */
  validateStep: (step?: number) => ValidateResult;
  loadFromStorage: () => Promise<void>;
};

const defaultData: OnboardingData = {
  language: undefined,
  personalInfo: {},
  moreInfo: {},
  location: {},
  profilePicture: undefined,
  farmLocation: undefined,
  farmInfo: {},
};

export const useOnboardingStore = create<OnboardingState>((set, get) => {
  // simple deep merge helper for nested objects (merges one level deep)
  const deepMerge = (target: any, patch: any) => {
    const out = { ...target };
    for (const key in patch) {
      const p = (patch as any)[key];
      if (p && typeof p === "object" && !Array.isArray(p)) {
        out[key] = { ...(target?.[key] ?? {}), ...p };
      } else {
        out[key] = p;
      }
    }
    return out;
  };

  // match the actual number of steps you validate (0–7)
  const TOTAL = 8;

  const validate = (stepIndex: number): ValidateResult => {
    const data = get().data;

    switch (stepIndex) {
      case 0: // Language
        if (!data.language)
          return { valid: false, message: "Please select a language." };
        return { valid: true };

      case 1: // Personal Info
        if (!data.personalInfo?.firstName || data.personalInfo.firstName.trim() === "")
          return { valid: false, message: "Please enter your first name." };
        if (!data.personalInfo?.lastName || data.personalInfo.lastName.trim() === "")
          return { valid: false, message: "Please enter your last name." };
        // make "otherNames" optional
        if (!data.personalInfo?.phone?.valid)
          return {
            valid: false,
            message: "Please enter a valid phone number.",
          };
        return { valid: true };

      case 2: // Phone Verification
        if (!data.personalInfo?.otpVerified) {
          return {
            valid: false,
            message: "Please verify your phone number before continuing.",
          };
        }
        return { valid: true };

      case 3: // More Info
        if (!data.moreInfo?.gender || data.moreInfo.gender.trim() === "")
          return { valid: false, message: "Please specify your gender." };
        return { valid: true };

      case 4: // Location
        if (!data.location?.region || data.location.region.trim() === "")
          return { valid: false, message: "Please enter your region." };
        if (!data.location?.district || data.location.district.trim() === "")
          return { valid: false, message: "Please enter your district." };
        return { valid: true };

      case 5: // Profile picture
        if (!data.profilePicture)
          return { valid: false, message: "Please upload a profile picture." };
        return { valid: true };

      case 6: // Farm Location
        if (
          !data.farmLocation ||
          data.farmLocation.latitude == null ||
          data.farmLocation.longitude == null
        )
          return {
            valid: false,
            message: "Please drop a valid farm location on the map.",
          };
        return { valid: true };

      case 7: // Farm Info
        if (!data.farmInfo?.farmName?.trim())
          return { valid: false, message: "Please enter your business name." };

        const farmSize = data.farmInfo.farmSize;
        if (!farmSize || farmSize <= 0)
          return { valid: false, message: "Please enter a valid farm size." };

        if (!data.farmInfo?.cropTypes || data.farmInfo.cropTypes.length === 0)
          return {
            valid: false,
            message: "Please select at least one crop type.",
          };

        return { valid: true };

      default:
        return { valid: true };
    }
  };

  return {
    currentStep: 0,
    totalSteps: TOTAL,
    data: defaultData,

    nextStep: () =>
      set((s) => ({
        currentStep: Math.min(s.currentStep + 1, s.totalSteps - 1),
      })),

    prevStep: () =>
      set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

    goToStep: (n: number) =>
      set((s) => ({ currentStep: Math.max(0, Math.min(n, s.totalSteps - 1)) })),

    updateData: (patch: Partial<OnboardingData>) =>
      set((s) => {
        const newData = deepMerge(s.data, patch);
        SecureStore.setItemAsync("onboardingData", JSON.stringify(newData)).catch((err) => {
          if (__DEV__) console.warn('Failed to persist onboardingData', err);
        });
        return { data: newData };
      }),

    reset: () => set({ currentStep: 0, data: defaultData }),

    validateStep: (step?: number) => {
      const idx = typeof step === "number" ? step : get().currentStep;
      return validate(idx);
    },
    loadFromStorage: async () => {
      try {
        const saved = await SecureStore.getItemAsync("onboardingData");
        if (saved) {
          const parsed = JSON.parse(saved);
          set({ data: parsed });
        }
      } catch (err) {
        console.error("Failed to load onboarding data", err);
      }
    },
  };
});
