// stores/onboardingStore.ts
import { PhoneValue } from "@/app/(auth)/login/components/PhoneInput";
import { create } from "zustand";

/**
 * Onboarding data shape
 */
export type Equipment = {
  equipment?: string;
  coverage?: string;
  price?: string;
};

export type OnboardingData = {
  language?: string;
  personalInfo: { name?: string; otherNames?: string; phone?: PhoneValue };
  moreInfo: {
    gender?: "Male" | "Female";
    age?: number;
  };

  location: { region?: string; district?: string };
  profilePicture?: string;
  farmLocation?: string;
  farmInfo: { farmName?: string; farmSize?: number; cropTypes?: string[] };
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

  // ✅ match the actual number of steps you validate (0–6)
  const TOTAL = 7;

  const validate = (stepIndex: number): ValidateResult => {
    const data = get().data;

    switch (stepIndex) {
      case 0: // Language
        if (!data.language)
          return { valid: false, message: "Please select a language." };
        return { valid: true };

      case 1: // Personal Info
        if (!data.personalInfo?.name || data.personalInfo.name.trim() === "")
          return { valid: false, message: "Please enter your full name." };
        // ✅ make "otherNames" optional
        if (!data.personalInfo?.phone?.valid)
          return {
            valid: false,
            message: "Please enter a valid phone number.",
          };
        return { valid: true };

      case 2: // More Info
        if (!data.moreInfo?.gender || data.moreInfo.gender.trim() === "")
          return { valid: false, message: "Please specify your gender." };
        return { valid: true };

      case 3: // Location
        if (!data.location?.region || data.location.region.trim() === "")
          return { valid: false, message: "Please enter your region." };
        if (!data.location?.district || data.location.district.trim() === "")
          return { valid: false, message: "Please enter your district." };
        return { valid: true };

      case 4: // Profile picture
        if (!data.profilePicture)
          return { valid: false, message: "Please upload a profile picture." };
        return { valid: true };

      case 5: // Farm Location
        if (!data.farmLocation || data.farmLocation.trim() === "")
          return {
            valid: false,
            message: "Please enter your business location address.",
          };
        return { valid: true };

      case 6: // Farm Info
        if (!data.farmInfo?.farmName || data.farmInfo.farmName.trim() === "")
          return { valid: false, message: "Please enter your business name." };
        if (!data.farmInfo?.farmSize || data.farmInfo.farmSize <= 0)
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
      set((s) => ({ data: deepMerge(s.data, patch) })),

    reset: () => set({ currentStep: 0, data: defaultData }),

    validateStep: (step?: number) => {
      const idx = typeof step === "number" ? step : get().currentStep;
      return validate(idx);
    },
  };
});
