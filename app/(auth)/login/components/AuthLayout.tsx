import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  TouchableWithoutFeedback,
  View,
  Platform,
  ScrollView,
} from "react-native";
import BackButton from "@/app/components/general/BackButton";
import FooterNote from "@/app/components/general/FooterNote";
import { Href, useRouter } from "expo-router";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  backHref?: Href;
  showBack?: boolean;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  backHref = "/",
  showBack = true,
}: AuthLayoutProps) {
  const router = useRouter();
  const canGoBack = typeof router.canGoBack === "function" ? router.canGoBack() : false;
  const shouldShowBack = showBack && canGoBack;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        {/* Scrollable area with keyboard avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 pt-20 px-8">
              {/* Back button - only render if stack has a route to go back to */}
              {shouldShowBack ? (
                <BackButton fallbackHref={backHref} />
              ) : (
                <View className="h-6" />
              )}

              {/* Header */}
              <View className="my-[4rem]">
                <Text className="text-[2rem] mb-2 font-mulish font-black text-center">
                  {title}
                </Text>
                {subtitle && <View className="mb-10">{subtitle}</View>}
              </View>

              {/* Form / children */}
              <View className="flex-1">{children}</View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer */}
        <FooterNote showText />
      </View>
    </TouchableWithoutFeedback>
  );
}
