import React from "react";
import {
  View,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

import { useOnboardingStore } from "@/stores/onboardingStore";
import FooterNote from "@/app/components/general/FooterNote";
import OnboardingHeader from "@/app/components/onboarding/OnboardingHeader";
import ProgressHeader from "@/app/components/onboarding/ProgressHeader";
import FooterActions from "@/app/components/onboarding/FooterActions";
import {
  onboardingSteps,
  PROGRESS_STEPS,
  optionalSteps,
} from "@/constants/onboardingSteps";

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
      Alert.alert(
        "Missing information",
        res.message ?? "Please complete this step."
      );
      return;
    }
    nextStep();
  };

  const handleFinish = async () => {
    const res = validateStep(currentStep);
    if (!res.valid) {
      Alert.alert(
        "Missing information",
        res.message ?? "Please complete this step."
      );
      return;
    }

    try {
      await SecureStore.setItemAsync("onboardingData", JSON.stringify(data));
      await SecureStore.setItemAsync("onboardingCompleted", "true");
      Alert.alert("Success", "Onboarding completed successfully!");
      reset();
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Error", "Failed to save onboarding data.");
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
