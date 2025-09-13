// layouts/OnboardingLayout.tsx
import React from "react";
import {
  View,
  Text,
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
import PrimaryButton from "@/app/components/general/PrimaryButton";
import BackButton from "@/app/components/general/BackButton";
import LanguageStep from "./components/LanguageStep";
import PersonalInfoStep from "./components/PersonalInfoStep";
import MoreInfoStep from "./components/MoreInfoStep";
import LocationStep from "./components/LocationStep";
import ProfilePictureStep from "./components/ProfilePictureStep";
import FarmLocationStep from "./components/FarmLocationStep";
import FarmInfoStep from "./components/FarmInfoStep";

// step indexes for optional skip
const steps = [
  LanguageStep, // 0
  PersonalInfoStep, // 1
  MoreInfoStep, // 2
  LocationStep, // 3 (optional)
  ProfilePictureStep, // 4 (optional)
  FarmLocationStep, // 5
  FarmInfoStep, // 6
];
const optionalSteps = [3, 4];

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

  const StepComponent = steps[currentStep] ?? (() => <View />);

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
      router.replace("/(tabs)/Dashboard");
    } catch (err) {
      Alert.alert("Error", "Failed to save onboarding data.");
      console.error(err);
    }
  };

  const isCurrentValid = validateStep(currentStep).valid;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1">
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
            <View className="flex-1 px-6 pt-12">
              {/* Header */}

              <Text className="text-center text-lg font-bold mb-6">
                Step {currentStep + 1} of {totalSteps}
              </Text>
              {/* Back Button */}
              {currentStep > 0 ? (
                <BackButton onPress={prevStep} />
              ) : (
                <View className="w-20" />
              )}
              {/* Step Content */}
              <StepComponent />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Section */}

        {/* bottom fixed row */}
        <View className="absolute w-full px-7 bottom-[10%] z-10">
          <View
            className={
              // use row layout; center vertically; space between when both buttons present
              optionalSteps.includes(currentStep)
                ? "flex-row items-center space-x-3 gap-5 justify-center"
                : "flex-row items-center"
            }
          >
            {/* Skip (40%) */}
            {optionalSteps.includes(currentStep) && (
              <PrimaryButton
                title="Skip"
                onPress={nextStep}
                className="w-[6rem] bg-light-yellow/55 text-black border "
              />
            )}

            {/* Primary button container: 60% when skip present, full width otherwise */}
            <View
              className={
                optionalSteps.includes(currentStep) ? "w-3/5" : "w-full"
              }
            >
              <PrimaryButton
                title={currentStep === totalSteps - 1 ? "Finish" : "Next"}
                onPress={
                  currentStep === totalSteps - 1 ? handleFinish : onNextPress
                }
                disabled={!isCurrentValid}
                textClassName="text-white"
              />
            </View>
          </View>
        </View>

        {/* Footer bg*/}
        <FooterNote />
      </View>
    </TouchableWithoutFeedback>
  );
}
