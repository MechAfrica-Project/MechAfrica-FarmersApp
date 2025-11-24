import RouterStateOverlay from "@/app/components/general/RouterStateOverlay";
import { useAuthStore } from "@/stores/authStore";
import { useRequestsStore } from "@/stores/requestsStore";
import { useFarmerStore } from "@/stores/farmerStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import "./globals.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  const [fontsLoaded] = useFonts({
    MulishRegular: require("../assets/fonts/Mulish-Regular.ttf"),
    MulishBold: require("../assets/fonts/Mulish-Bold.ttf"),
    MulishSemiBold: require("../assets/fonts/Mulish-SemiBold.ttf"),
  });

  useEffect(() => {
    // Restore session then perform initial data sync if authenticated
    (async () => {
      await restoreSession();

      // If restoreSession set a token, sync core data in background
      const token = useAuthStore.getState().token;
      if (token) {
        const rs = useRequestsStore.getState();
        const fs = useFarmerStore.getState();
        const ns = useNotificationStore.getState();
        // fire-and-forget but wait for settled to avoid unhandled rejections
        Promise.allSettled([
          rs.fetchRequests ? rs.fetchRequests() : Promise.resolve(),
          fs.fetchProfile ? fs.fetchProfile() : Promise.resolve(),
          ns.fetchNotifications ? ns.fetchNotifications() : Promise.resolve(),
        ]).catch(() => {});
      }
    })();
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
      <RouterStateOverlay />
    </View>
  );
}
