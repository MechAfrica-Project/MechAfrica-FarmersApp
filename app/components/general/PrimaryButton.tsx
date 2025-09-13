import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useUIStore } from "@/stores/uiStore";

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  /** Extra Tailwind classes to merge with defaults */
  className?: string;
  /** Extra Tailwind classes for the text */
  textClassName?: string;
};

const PrimaryButton = ({
  title,
  onPress,
  disabled,
  className,
  textClassName,
}: Props) => {
  const loading = useUIStore((s) => s.loading);

  return (
    <TouchableOpacity
      className={`bg-primary-green py-4 rounded-lg items-center ${
        disabled || loading ? "opacity-80" : ""
      } ${className ?? ""}`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          className={` font-semibold text-base ${
            textClassName ?? ""
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
