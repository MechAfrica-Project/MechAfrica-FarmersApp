import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useUIStore } from "@/stores/uiStore";

const GlobalLoader = () => {
  const loading = useUIStore((s) => s.loading);

  if (!loading) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <ActivityIndicator size="large" color="#fff" />
      <Text className="mt-3 text-white text-base font-semibold">Loading...</Text>
    </View>
  );
};

export default GlobalLoader;
