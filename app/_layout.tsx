import OfflineQueueIndicator from "@/app/components/general/OfflineQueueIndicator";
import RouterStateOverlay from "@/app/components/general/RouterStateOverlay";
import { CustomToast } from "@/app/components/general/CustomToast";
import { startNetworkMonitoring } from "@/lib/network";
import { setToastRef } from '@/lib/toast';
import { useAuthStore } from "@/stores/authStore";
import { useFarmerStore } from "@/stores/farmerStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useRequestsStore } from "@/stores/requestsStore";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { ToastProvider, useToast } from 'react-native-toast-notifications';
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

  useEffect(() => {
    let stop: (() => void) | null = null;
    (async () => {
      try {
        stop = await startNetworkMonitoring();
      } catch {}
    })();

    return () => {
      try {
        if (stop) stop();
      } catch {}
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ToastProvider
      placement="top"
      duration={4000}
      offsetTop={50} // Adjusted for better positioning across devices
      offsetBottom={40}
      animationType="slide-in"
      animationDuration={250} // Slightly faster animation
      swipeEnabled={true}
      maxToasts={5} // Allow more concurrent toasts
      renderToast={(toast) => (
        <CustomToast
          message={toast.message}
          type={toast.type as 'success' | 'error' | 'info' | 'warning' | 'normal'}
          title={toast.data?.title}
          onDismiss={toast.onHide}
          actions={toast.data?.actions}
        />
      )}
      successColor="#10B981"
      errorColor="#EF4444"
      warningColor="#F59E0B"
      infoColor="#3B82F6"
      normalColor="#6B7280"
    >
      {/* Register provider's imperative API to our lib/toast via hook inside the provider */}
      <ToastRegistrar />
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <OfflineQueueIndicator />
        <Stack screenOptions={{ headerShown: false }} />
        <RouterStateOverlay />
      </View>
    </ToastProvider>
  );
}

function ToastRegistrar() {
  const toast = useToast();
  useEffect(() => {
    try {
      setToastRef(toast as any);
      return () => setToastRef(null);
    } catch {
      return;
    }
  }, [toast]);
  return null;
}
