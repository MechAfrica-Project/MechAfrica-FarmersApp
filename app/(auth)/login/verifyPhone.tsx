import PrimaryButton from "@/app/components/general/PrimaryButton";
import ShakeableView, { ShakeableViewRef } from "@/app/components/general/ShakeableView";
import { useAuthStore } from "@/stores/authStore";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import AuthLayout from "./components/AuthLayout";

export default function VerifyPhone() {
  const phone = useAuthStore((s) => s.phone?.formatted || s.phone?.raw || "");
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const wrapperRef = useRef<ShakeableViewRef>(null);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleVerify = async () => {
    const success = await verifyOtp(code);
    if (!success) wrapperRef.current?.shake();
  };

  return (
    <AuthLayout
      backHref="/(auth)/login/signIn"
      title="Verify Phone number"
      subtitle={
        <Text className="font-mulish text-center text-gray-400 font-medium">
          Please enter the 5-digit OTP code sent to{" "}
          <Text className="font-medium">{phone}</Text>
        </Text>
      }
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 flex-1">
            <ShakeableView ref={wrapperRef} className="mb-6">
              <OtpInput
                numberOfDigits={5}
                type="numeric"
                focusColor="#10B981" // Tailwind green-500
                hideStick={true}
                blurOnFilled={true}
                onTextChange={setCode}
                onFilled={handleVerify} // auto-submit when full
                textInputProps={{
                  className: "border-gray-300 text-center text-xl font-bold rounded-2xl w-14 h-14 bg-white",
                }}
                textProps={{
                  allowFontScaling: false,
                }}
              />
            </ShakeableView>

            {error && (
              <Text className="text-red-500 mb-3 text-center font-mulish">
                {error}
              </Text>
            )}

            <PrimaryButton
              title={loading ? "Verifying..." : "Log in"}
              onPress={handleVerify}
              textClassName="text-white"
              loading={loading}
            />

            <View className="flex flex-row justify-center mt-4">
              {timeLeft > 0 ? (
                <Text className="text-primary-green font-mulish font-medium">
                  Resend in {timeLeft}s
                </Text>
              ) : (
                <TouchableOpacity onPress={() => setTimeLeft(30)}>
                  <Text className="text-primary-green font-mulish font-medium">
                    Send code again
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
}
