import React from "react";
import { View } from "react-native";
import PrimaryButton from "@/app/components/general/PrimaryButton";

interface FooterActionsProps {
  currentStep: number;
  totalSteps: number;
  isCurrentValid: boolean;
  optionalSteps: number[];
  onNext: () => void;
  onFinish: () => void;
  onSkip: () => void;
  finishLoading?: boolean;
}

export default function FooterActions({
  currentStep,
  totalSteps,
  isCurrentValid,
  optionalSteps,
  onNext,
  onFinish,
  onSkip,
  finishLoading = false,
}: FooterActionsProps) {
  const isLastStep = currentStep === totalSteps - 1;
  const isOptional = optionalSteps.includes(currentStep);

  return (
    <View className="absolute w-full px-7 bottom-[10%] z-10">
      <View
        className={
          isOptional
            ? "flex-row items-center space-x-3 gap-5 justify-center"
            : "flex-row items-center"
        }
      >
        {/* Skip (only for optional steps) */}
        {isOptional && (
          <PrimaryButton
            title="Skip"
            onPress={onSkip}
            className="w-[6rem] bg-yellow-100 border"
          />
        )}

        {/* Main button */}
        <View className={isOptional ? "w-3/5" : "w-full"}>
          <PrimaryButton
            title={isLastStep ? "Finish" : "Next"}
            onPress={isLastStep ? onFinish : onNext}
            disabled={!isCurrentValid || (isLastStep && finishLoading)}
            textClassName="text-white"
            loading={isLastStep && finishLoading}
          />
        </View>
      </View>
    </View>
  );
}
