import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useCallback } from "react";
import { View } from "react-native";
import "./globals.css";
import { useAuthStore } from "@/stores/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const [fontsLoaded] = useFonts({
    MulishRegular: require("../assets/fonts/Mulish-Regular.ttf"),
    MulishBold: require("../assets/fonts/Mulish-Bold.ttf"),
    MulishSemiBold: require("../assets/fonts/Mulish-SemiBold.ttf"),
  });

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
