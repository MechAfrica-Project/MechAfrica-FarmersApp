// app/(auth)/login/signIn.tsx
import PrimaryButton from "@/app/components/general/PrimaryButton";
import { toastError } from '@/lib/toast';
import { useAuthStore } from "@/stores/authStore";
import { useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import AuthLayout from "./components/AuthLayout";
import PhoneInput from "./components/PhoneInput";

export default function SignIn() {
  const setPhone = useAuthStore((s) => s.setPhone);
  const sendPhone = useAuthStore((s) => s.sendPhone);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    // no-op: avoid intercepting navigation here to prevent interfering
    // with router internals (previous attempts caused navigator errors
    // in development). If needed, gesture disabling is handled in
    // `app/(auth)/_layout.tsx`.
    return () => { };
  }, [navigation]);

  // We display errors inline below the phone input instead of using a toast

  return (
    <AuthLayout
      backHref="/"
      title="Welcome back."
      subtitle={
        <Text className="font-mulish text-center text-gray-400 font-medium">
          Ready to take your farming{"\n"}to the next level again?
        </Text>
      }
    >
      <View>
        <PhoneInput
          label="Telephone number"
          onChange={(val) => {
            setPhone(val);
          }}
        />

        {error ? (
          <Text className="text-red-500 font-mulish text-sm text-center mb-4 px-4">
            {error}
          </Text>
        ) : null}

        {error?.toLowerCase().includes("account as a provider") && (
          <PrimaryButton
            title="Sign up as a Farmer instead"
            onPress={() => router.push("/(auth)/onboarding/OnboardingLayout")}
            textClassName="text-black"
            className="bg-accent-yellow mb-4"
          />
        )}

        <PrimaryButton
          title="Log in"
          onPress={() => sendPhone()}
          textClassName="text-white"
          loading={loading}
        />
      </View>
    </AuthLayout>
  );
}
