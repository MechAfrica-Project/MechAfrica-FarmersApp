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
    title: "More information",
    subtitle: "",
    description: "Let’s get to know you more",
    Component: MoreInfoStep,
  },
  {
    title: "Where are you",
    subtitle: "",
    description: "Help us know which regions and district you are in",
    Component: LocationStep,
  },
  {
    title: "Upload your Picture",
    subtitle: "",
    description:
      "Let us know how you look to better connect \nyou to farmers and providers in Ghana.",
    Component: ProfilePictureStep,
    optional: true,
  },
  {
    title: "Location of your",
    subtitle: " farm",
    description:
      "Register your farm to connect  to the \nworld of farming, we need your farm \nlocation.",
    Component: FarmLocationStep,
    optional: true,
  },
  {
    title: "More about your farm",
    subtitle: "",
    description:
      "We would love to hear more about \nwhat you have going on, on site.",
    Component: FarmInfoStep,
  },
];

export const PROGRESS_STEPS = onboardingSteps.length - 1;
// excludes step 0 (Language step)

export const optionalSteps = onboardingSteps
  .map((s, i) => (s.optional ? i : null))
  .filter((i) => i !== null);
