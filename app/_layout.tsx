import { useWebSocket } from '@/hooks/useWebSocket';
import OfflineQueueIndicator from "@/app/components/general/OfflineQueueIndicator";
import RouterStateOverlay from "@/app/components/general/RouterStateOverlay";
import ErrorBoundary from "@/app/components/general/ErrorBoundary";
import Toast from "react-native-toast-message";
import { toastConfig } from "./components/general/ToastConfig";
import { loadTokensFromStorage } from '@/lib/api';
import { startNetworkMonitoring } from "@/lib/network";
import { useAuthStore } from "@/stores/authStore";
import { useFarmerStore } from "@/stores/farmerStore";
import { useCatalogStore } from "@/stores/catalogStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useRequestsStore } from "@/stores/requestsStore";
import { useFonts } from "expo-font";
import { Stack, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import { useAppUpdateCheck } from "@/hooks/useAppUpdateCheck";
import UpdateRequiredModal from "./components/general/UpdateRequiredModal";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useWebSocket();

  const restoreSession = useAuthStore((s) => s.restoreSession);
  const token = useAuthStore((s) => s.token);
  const authLoading = useAuthStore((s) => s.loading);
  const segments = useSegments();
  const router = useRouter();

  // Initialize OTA and Store Version Update Checker
  const {
    storeUpdateRequired,
    storeUpdateOptional,
    storeUrl,
    updateMessage,
    dismissSoftUpdate,
  } = useAppUpdateCheck('farmers');

  const [fontsLoaded] = useFonts({
    MulishRegular: require("../assets/fonts/Mulish-Regular.ttf"),
    MulishBold: require("../assets/fonts/Mulish-Bold.ttf"),
    MulishSemiBold: require("../assets/fonts/Mulish-SemiBold.ttf"),
  });

  useEffect(() => {
    // Restore session then perform initial data sync if authenticated
    (async () => {
      // Load persisted tokens into api client memory (AsyncStorage)
      try { await loadTokensFromStorage(); } catch { }

      // Fetch public catalogs immediately
      useCatalogStore.getState().fetchCatalogs().catch(() => {});

      await restoreSession();

      // If restoreSession set a token, sync core data in background
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        const rs = useRequestsStore.getState();
        const fs = useFarmerStore.getState();
        const ns = useNotificationStore.getState();
        // fire-and-forget but wait for settled to avoid unhandled rejections
        Promise.allSettled([
          rs.fetchRequests ? rs.fetchRequests() : Promise.resolve(),
          fs.fetchProfile ? fs.fetchProfile() : Promise.resolve(),
          ns.fetchNotifications ? ns.fetchNotifications() : Promise.resolve(),
        ]).catch(() => { });
      }
    })();
  }, [restoreSession]);

  // Global Auth Guard
  useEffect(() => {
    if (authLoading) return; // Wait until session restoration resolves

    const inAuthGroup = segments[0] === '(auth)';
    const isIndex = (segments as string[]).length === 0;
    const isOnboarding = segments.includes('onboarding');

    if (token) {
      if ((inAuthGroup && !isOnboarding) || isIndex) {
        // User has a token but is stuck on the login or welcome screen -> Auto redirect to tabs
        router.replace('/(tabs)');
      }
    } else if (!token && !inAuthGroup && !isIndex) {
      // User is logged out but trying to view protected screens -> Send to login
      router.replace('/(auth)/login/signIn');
    }
  }, [token, authLoading, segments]);

  useEffect(() => {
    let stop: (() => void) | null = null;
    (async () => {
      try {
        stop = await startNetworkMonitoring();
      } catch { }
    })();

    return () => {
      try {
        if (stop) stop();
      } catch { }
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <OfflineQueueIndicator />
          <Stack screenOptions={{ headerShown: false }} />
          <RouterStateOverlay />

          {/* App Version Check Modals */}
          <UpdateRequiredModal
            visible={storeUpdateRequired || storeUpdateOptional}
            isForce={storeUpdateRequired}
            message={updateMessage}
            storeUrl={storeUrl}
            onDismiss={dismissSoftUpdate}
          />
        </View>
        <Toast config={toastConfig} />
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
