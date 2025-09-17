import React from "react";
import { View, Text } from "react-native";

interface OnboardingHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
}

export default function OnboardingHeader({
  title,
  subtitle,
  description,
}: OnboardingHeaderProps) {
  return (
    <View className="mt-8">
      <Text className="text-center text-[1.9rem] font-bold mb-2">
        {title}
        {subtitle && (
          <Text className="text-primary-green">{subtitle}</Text>
        )}
      </Text>
      {description && (
        <Text className="font-mulish text-center text-[1.1rem] text-gray-400 font-medium">
          {description}
        </Text>
      )}
    </View>
  );
}
