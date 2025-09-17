import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useUIStore } from "@/stores/uiStore";

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  /** Extra Tailwind classes to merge with defaults */
  className?: string;
  /** Extra Tailwind classes for the text */
  textClassName?: string;
};

const PrimaryButton = ({ title, onPress, className, textClassName }: Props) => {
  const loading = useUIStore((s) => s.loading);

  return (
    <TouchableOpacity
      className={`bg-primary-green py-4 rounded-lg items-center ${
        className ?? ""
      }`}
      onPress={onPress}
      activeOpacity={0.9} // ✅ keeps button interactive
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          className={`font-semibold text-base ${textClassName ?? ""}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
