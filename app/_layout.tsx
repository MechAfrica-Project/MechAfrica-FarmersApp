// app/_layout.tsx or app/(whatever)/RootLayout.tsx (the file you pasted)
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import "./globals.css";
import { useAuthStore } from "@/stores/authStore";
// import GlobalLoader from "@/app/components/general/GlobalLoader"; // <- REMOVE

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession(); // check token on app launch
  }, []);

  const [fontsLoaded] = useFonts({
    MulishRegular: require("../assets/fonts/Mulish-Regular.ttf"),
    MulishBold: require("../assets/fonts/Mulish-Bold.ttf"),
    MulishSemiBold: require("../assets/fonts/Mulish-SemiBold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return <View style={{ flex: 1 }} />;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      {/* GlobalLoader removed so no overlay at startup.
          You can mount GlobalLoader inside specific screens when you need it. */}
    </>
  );
}
