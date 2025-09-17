// components/general/BackButton.tsx
import React from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type Props = {
  /** If provided, this will run instead of the default `router.back()` */
  onPress?: (event: GestureResponderEvent) => void;
  /** Icon color (default: "black") */
  color?: string;
  /** Accessibility label for the button (default: "Go back") */
  accessibilityLabel?: string;
};

export default function BackButton({
  onPress,
  color = "black",
  accessibilityLabel = "Go back",
}: Props) {
  const router = useRouter();

  const handlePress = (e: GestureResponderEvent) => {
    if (typeof onPress === "function") {
      onPress(e);
      return;
    }
    // default behavior
    try {
      router.back();
    } catch {
      // fallback to a safe route if back fails
      router.replace("/(tabs)");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Feather name="arrow-left" size={24} color={color} />
    </TouchableOpacity>
  );
}
