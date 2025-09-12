// app/(auth)/login/signIn.tsx
import React from "react";
import { View, Text } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import AuthLayout from "@/app/components/authScreens/AuthLayout";
import PhoneInput from "@/app/components/authScreens/PhoneInput";
import PrimaryButton from "@/app/components/general/PrimaryButton";

export default function SignIn() {
  const setPhone = useAuthStore((s) => s.setPhone);
  const sendPhone = useAuthStore((s) => s.sendPhone);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  return (
    <AuthLayout
      backHref="/"
      title="Welcome back."
      subtitle={
        <Text style={{ color: "#6b7280", fontSize: 16, textAlign: "center" }}>
          Ready to take your farming{"\n"}to the next level again?
        </Text>
      }
    >
      <View>
        <PhoneInput
          label="Telephone number"
          onChange={(val) => {
            setPhone(val.formatted, val.raw);
          }}
        />

        {error && (
          <Text style={{ color: "#ef4444", marginTop: 6 }}>{error}</Text>
        )}

        <PrimaryButton
          title="Log in"
          onPress={() => sendPhone()}
          disabled={loading}
        />
      </View>
    </AuthLayout>
  );
}
