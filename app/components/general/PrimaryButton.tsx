import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from "react-native";
import { useUIStore } from "@/stores/uiStore";

type Props = TouchableOpacityProps & {
  title: string;
  onPress: (() => void) | (() => Promise<void>);
  /** Extra Tailwind classes to merge with defaults */
  className?: string;
  /** Extra Tailwind classes for the text */
  textClassName?: string;
  /** Optional loading state for this button. If omitted, falls back to global UI loading. */
  loading?: boolean;
};

const PrimaryButton = ({ title, onPress, className, textClassName, loading: loadingProp, disabled, ...rest }: Props) => {
  const globalLoading = useUIStore((s) => s.loading);
  const loading = typeof loadingProp === "boolean" ? loadingProp : globalLoading;

  return (
    <TouchableOpacity
      className={`bg-primary-green py-4 rounded-lg items-center ${className ?? ""}`}
      onPress={onPress as any}
      activeOpacity={0.9}
      disabled={disabled ?? loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className={`font-semibold text-base ${textClassName ?? ""}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
