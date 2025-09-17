// app/(auth)/login/signIn.tsx
import PrimaryButton from "@/app/components/general/PrimaryButton";
import { useAuthStore } from "@/stores/authStore";
import React from "react";
import { Text, View } from "react-native";
import AuthLayout from "./components/AuthLayout";
import PhoneInput from "./components/PhoneInput";

export default function SignIn() {
  const setPhone = useAuthStore((s) => s.setPhone);
  const sendPhone = useAuthStore((s) => s.sendPhone);
  const error = useAuthStore((s) => s.error);

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

        {error && (
          <Text className="text-red-500 mt-1 font-mulish text-center">
            {error}
          </Text>
        )}

        <PrimaryButton
          title="Log in"
          onPress={() => sendPhone()}
          textClassName="text-white"
        />
      </View>
    </AuthLayout>
  );
}
