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
import { Href } from "expo-router";

export default function AuthLayout({
  children,
  title,
  subtitle,
  backHref = "/",
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
  backHref?: Href;
}) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-white"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-between pt-28 px-8">
              <BackButton />
              <View className="my-15">
                <Text className="text-[2rem] mb-2 font-mulish font-black text-center">
                  {title}
                </Text>
                {subtitle && <View className="mb-10">{subtitle}</View>}
              </View>
              {children}
            </View>
            <FooterNote />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
