import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import * as Updates from "expo-updates";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// User-friendly error message formatter
const formatErrorMessage = (error: Error | null): string => {
  if (!error) return "An unexpected error occurred.";
  const msg = error.message?.toLowerCase() || "";

  if (msg.includes("network") || msg.includes("fetch")) {
    return "Please check your internet connection and try again.";
  }
  if (msg.includes("timeout")) {
    return "The connection timed out. Please try again later.";
  }
  if (msg.includes("json")) {
    return "We received unexpected data from the server. Our team has been notified.";
  }
  if (msg.includes("unauthorized") || msg.includes("token")) {
    return "Your session may have expired. Please restart the app.";
  }

  // Return a generic friendly message if it's an ugly technical error
  if (
    msg.includes("cannot read property") ||
    msg.includes("undefined") ||
    msg.includes("null")
  ) {
    return "We encountered a technical hiccup. Please restart the app to continue.";
  }

  return error.message || "An unexpected error occurred.";
};

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error("Uncaught error:", error, errorInfo);
    }
    // TODO: Send to Sentry/Crashlytics in prod
  }

  handleRestart = async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      // Fallback if reloadAsync is unavailable (e.g., in Expo Go)
      this.setState({ hasError: false, error: null });
    }
  };

  render() {
    if (this.state.hasError) {
      const isIOS = Platform.OS === "ios";
      const friendlyMessage = formatErrorMessage(this.state.error);

      const content = (
        <SafeAreaView
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              width: "100%",
              maxWidth: 400,
              alignItems: "center",
              padding: 32,
              borderRadius: 24,
              backgroundColor: isIOS ? "transparent" : "#ffffff",
              ...(isIOS
                ? {}
                : {
                    elevation: 8,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                  }),
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FEF2F2",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Ionicons name="warning" size={40} color="#EF4444" />
            </View>

            <Text
              style={{
                fontSize: 24,
                fontFamily: "MulishBold",
                color: "#111827",
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Oops! Something went wrong
            </Text>

            <Text
              style={{
                fontSize: 16,
                fontFamily: "MulishRegular",
                color: "#4B5563",
                textAlign: "center",
                marginBottom: 32,
                lineHeight: 24,
              }}
            >
              {friendlyMessage}
            </Text>

            <TouchableOpacity
              onPress={this.handleRestart}
              style={{
                backgroundColor: "#059669",
                paddingHorizontal: 32,
                paddingVertical: 16,
                borderRadius: 100,
                width: "100%",
              }}
              activeOpacity={0.8}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontFamily: "MulishBold",
                  textAlign: "center",
                }}
              >
                Restart App
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );

      if (isIOS) {
        return (
          <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
            <BlurView intensity={80} tint="light" style={{ flex: 1 }}>
              {content}
            </BlurView>
          </View>
        );
      }

      return (
        <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>{content}</View>
      );
    }

    return this.props.children;
  }
}
