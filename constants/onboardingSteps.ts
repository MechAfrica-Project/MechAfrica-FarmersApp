import FarmInfoStep from "@/app/(auth)/onboarding/components/FarmInfoStep";
import FarmLocationStep from "@/app/(auth)/onboarding/components/FarmLocationStep";
import LanguageStep from "@/app/(auth)/onboarding/components/LanguageStep";
import LocationStep from "@/app/(auth)/onboarding/components/LocationStep";
import MoreInfoStep from "@/app/(auth)/onboarding/components/MoreInfoStep";
import PersonalInfoStep from "@/app/(auth)/onboarding/components/PersonalInfoStep";
import ProfilePictureStep from "@/app/(auth)/onboarding/components/ProfilePictureStep";

// Each step exports: { title, subtitle?, description?, Component, optional? }
export const onboardingSteps = [
  {
    title: "Welcome to",
    subtitle: " MechAfrica",
    description:
      "Select your preferred language.\nThis helps us serve you better.",
    Component: LanguageStep,
  },
  {
    title: "Great to meet you,",
    subtitle: "",
    description: " Please provide your full name \nand contact number",
    Component: PersonalInfoStep,
  },
  {
    title: "More info",
    subtitle: "",
    description: "Provide extra details to personalize your experience.",
    Component: MoreInfoStep,
  },
  {
    title: "Set your",
    subtitle: " location",
    description: "We’ll use this info to better tailor your experience.",
    Component: LocationStep,
    optional: true,
  },
  {
    title: "Add your",
    subtitle: " profile picture",
    description: "Upload a picture so others can recognize you.",
    Component: ProfilePictureStep,
    optional: true,
  },
  {
    title: "Where is your",
    subtitle: " farm?",
    description: "Let us know where your farm is located.",
    Component: FarmLocationStep,
  },
  {
    title: "Farm info",
    subtitle: "",
    description: "Add details about your farm setup.",
    Component: FarmInfoStep,
  },
];

export const PROGRESS_STEPS = onboardingSteps.length - 1;
// excludes step 0 (Language step)

export const optionalSteps = onboardingSteps
  .map((s, i) => (s.optional ? i : null))
  .filter((i) => i !== null);
