import { toastError, toastSuccess } from '@/lib/toast';
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import FooterNote from "@/app/components/general/FooterNote";
import FooterActions from "@/app/components/onboarding/FooterActions";
import OnboardingHeader from "@/app/components/onboarding/OnboardingHeader";
import ProgressHeader from "@/app/components/onboarding/ProgressHeader";
import { farmer, uploadFile } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/apiEndpoints";
import {
  onboardingSteps,
  optionalSteps,
  PROGRESS_STEPS,
} from "@/constants/onboardingSteps";
import { useFarmerStore } from "@/stores/farmerStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
// note: toasts are shown via lib/toast helper

export default function OnboardingLayout() {
  const {
    currentStep,
    nextStep,
    prevStep,
    totalSteps,
    data,
    validateStep,
    reset,
  } = useOnboardingStore();
  const fetchProfile = useFarmerStore((state) => state.fetchProfile);
  const [submitting, setSubmitting] = React.useState(false);

  const router = useRouter();

  const { title, subtitle, description, Component } =
    onboardingSteps[currentStep] ?? ({} as any);

  const onNextPress = () => {
    const res = validateStep(currentStep);
    if (!res.valid) {
      toastError('Missing information', res.message ?? 'Please complete this step.');
      return;
    }
    nextStep();
  };

  const uploadProfilePictureIfNeeded = async () => {
    const uri = data.profilePicture;
    if (!uri || /^https?:/i.test(uri)) {
      return data;
    }

    try {
      const result = await uploadFile(`${API_ENDPOINTS.UPLOADS}/profile-picture`, {
        uri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      const uploadedUrl = result?.url ?? result?.location;
      if (uploadedUrl) {
        return { ...data, profilePicture: uploadedUrl };
      }
    } catch (err) {
      console.warn("Profile picture upload failed", err);
    }
    return data;
  };

  const handleFinish = async () => {
    if (submitting) return;

    const res = validateStep(currentStep);
    if (!res.valid) {
      toastError('Missing information', res.message ?? 'Please complete this step.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = await uploadProfilePictureIfNeeded();
      await SecureStore.setItemAsync("onboardingData", JSON.stringify(payload));

      const remoteResult = await farmer.saveProfile(payload);
      const queued = Boolean(remoteResult && (remoteResult as any).queued);

      await SecureStore.setItemAsync("onboardingCompleted", "true");

      if (queued) {
        toastSuccess('Profile queued', "You're offline—profile will sync once online.");
      } else {
        toastSuccess('Onboarding completed', 'Onboarding completed successfully!');
        if (typeof fetchProfile === "function") {
          try {
            await fetchProfile();
          } catch (err) {
            console.warn("Failed to refresh profile after onboarding", err);
          }
        }
      }

      reset();
      router.replace("/(tabs)");
    } catch (err) {
      toastError('Save failed', 'Failed to sync onboarding data.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isCurrentValid = validateStep(currentStep).valid;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        {/* Scrollable area with keyboard avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 px-6 pt-[6rem]">
              {/* Progress bar + back button (only show from step 1 → step 6) */}
              {currentStep > 0 && (
                <ProgressHeader
                  currentStep={currentStep}
                  totalSteps={PROGRESS_STEPS}
                  onBack={prevStep}
                />
              )}

              {/* Title + description */}
              <OnboardingHeader
                title={title}
                subtitle={subtitle}
                description={description}
              />

              {/* Step content */}
              <Component />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Section (Skip / Next / Finish) */}
        <FooterActions
          currentStep={currentStep}
          totalSteps={totalSteps}
          isCurrentValid={isCurrentValid}
          optionalSteps={optionalSteps}
          onNext={onNextPress}
          onFinish={handleFinish}
          onSkip={nextStep}
          finishLoading={submitting}
        />

        {/* Footer background */}
        <FooterNote />
      </View>
    </TouchableWithoutFeedback>
  );
}
