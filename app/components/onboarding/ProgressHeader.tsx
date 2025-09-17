import React from "react";
import { View } from "react-native";
import BackButton from "@/app/components/general/BackButton";

interface ProgressHeaderProps {
  currentStep: number;
  totalSteps: number; // PROGRESS_STEPS
  onBack: () => void;
}

export default function ProgressHeader({
  currentStep,
  totalSteps,
  onBack,
}: ProgressHeaderProps) {
  return (
    <View className="flex-row items-center justify-center mb-6">
      {/* Back Button */}
      <BackButton onPress={onBack} />

      {/* Step Indicators */}
      <View className="flex-row items-center justify-center flex-1">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={`mx-1 rounded-full  ${
              index === currentStep - 1
                ? "h-4 w-8 bg-primary-green border-4 border-green-400"
                : "h-4 w-8 bg-gray-200"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
