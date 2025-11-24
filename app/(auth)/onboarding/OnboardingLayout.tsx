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
import {
  onboardingSteps,
  optionalSteps,
  PROGRESS_STEPS,
} from "@/constants/onboardingSteps";
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

  const router = useRouter();

  const { title, subtitle, description, Component } =
    onboardingSteps[currentStep] ?? ({} as any);

  const onNextPress = () => {
    const res = validateStep(currentStep);
    if (!res.valid) {
      try { toastError('Missing information', res.message ?? 'Please complete this step.'); } catch {}
      return;
    }
    nextStep();
  };

  const handleFinish = async () => {
    const res = validateStep(currentStep);
    if (!res.valid) {
      try { toastError('Missing information', res.message ?? 'Please complete this step.'); } catch {}
      return;
    }

    try {
      await SecureStore.setItemAsync("onboardingData", JSON.stringify(data));
      await SecureStore.setItemAsync("onboardingCompleted", "true");
      try { toastSuccess('Onboarding completed', 'Onboarding completed successfully!'); } catch {}
      reset();
      router.replace("/(tabs)");
    } catch (err) {
      try { toastError('Save failed', 'Failed to save onboarding data.'); } catch {}
      console.error(err);
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
        />

        {/* Footer background */}
        <FooterNote />
      </View>
    </TouchableWithoutFeedback>
  );
}
