// components/general/BackButton.tsx
import React from "react";
import { TouchableOpacity, GestureResponderEvent } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, Href } from "expo-router";

type Props = {
  /** If provided, this will run instead of the default `router.back()` */
  onPress?: (event: GestureResponderEvent) => void;
  fallbackHref?: Href;
  /** Icon color (default: "black") */
  color?: string;
  /** Accessibility label for the button (default: "Go back") */
  accessibilityLabel?: string;
};

export default function BackButton({
  onPress,
  fallbackHref = "/",
  color = "black",
  accessibilityLabel = "Go back",
}: Props) {
  const router = useRouter();

  const handlePress = (e: GestureResponderEvent) => {
    if (typeof onPress === "function") {
      onPress(e);
      return;
    }
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackHref as any);
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
