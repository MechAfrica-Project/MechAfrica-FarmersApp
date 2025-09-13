import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { useUIStore } from "@/stores/uiStore";

type Props = {
  title: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

const PrimaryButton = ({ title, onPress, disabled }: Props) => {
  const loading = useUIStore((s) => s.loading);

  return (
    <TouchableOpacity
      className={`bg-primary-green py-4 rounded-lg items-center ${
        disabled || loading ? "opacity-60" : ""
      }`}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className="text-white font-semibold text-base">{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
