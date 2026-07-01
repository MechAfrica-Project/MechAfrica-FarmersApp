import PrimaryButton from "@/app/components/general/PrimaryButton";
import ShakeableView, { ShakeableViewRef } from "@/app/components/general/ShakeableView";
import { useAuthStore } from "@/stores/authStore";
import { AlertCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import AuthLayout from "./components/AuthLayout";

export default function VerifyPhone() {
  const phone = useAuthStore((s) => s.phone?.formatted || s.phone?.raw || "");
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const sendPhone = useAuthStore((s) => s.sendPhone);
  const otpCooldownUntil = useAuthStore((s) => s.otpCooldownUntil);

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const wrapperRef = useRef<ShakeableViewRef>(null);
  const otpInputRef = useRef<OtpInputRef>(null);
  const isVerifyingRef = useRef(false); // Prevent double submission
  const cooldownRemaining = otpCooldownUntil ? Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000)) : 0;
  const showRateLimitHint = cooldownRemaining > 60 || (!!error && /Try again in/i.test(error));
  const cooldownMinutes = Math.ceil(cooldownRemaining / 60);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // sync with store cooldown
  useEffect(() => {
    if (!otpCooldownUntil) return setTimeLeft(0);
    const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
    setTimeLeft(remaining);
  }, [otpCooldownUntil]);

  // Accept optional code parameter for direct use from onFilled callback
  // This avoids race condition where state hasn't updated yet
  const handleVerify = useCallback(async (otpCode?: string) => {
    const codeToVerify = (otpCode || code || "").trim();

    // Debug logging
    if (__DEV__) {
      console.debug('[verifyPhone] handleVerify called:', {
        otpCodeParam: otpCode,
        codeState: code,
        codeToVerify,
        length: codeToVerify.length,
        isVerifying: isVerifyingRef.current,
      });
    }

    // Validate code length
    if (codeToVerify.length !== 6) {
      if (__DEV__) {
        console.warn('[verifyPhone] Rejecting incomplete code:', codeToVerify.length);
      }
      return;
    }

    // Prevent double submission
    if (isVerifyingRef.current) {
      if (__DEV__) {
        console.debug('[verifyPhone] Already verifying, skipping');
      }
      return;
    }

    isVerifyingRef.current = true;
    try {
      const success = await verifyOtp(codeToVerify);
      if (!success) {
        wrapperRef.current?.shake();
        otpInputRef.current?.clear();
        setCode("");
      }
    } finally {
      isVerifyingRef.current = false;
    }
  }, [code, verifyOtp]);

  return (
    <AuthLayout
      backHref="/(auth)/login/signIn"
      title="Verify Phone number"
      subtitle={
        <Text className="font-mulish text-center text-gray-400 font-medium">
          Please enter the 6-digit OTP code sent to{" "}
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
                ref={otpInputRef}
                numberOfDigits={6}
                type="numeric"
                focusColor="#10B981"
                hideStick={true}
                blurOnFilled={true}
                onTextChange={(text) => {
                  if (__DEV__) {
                    console.debug('[verifyPhone] onTextChange:', text, 'length:', text.length);
                  }
                  setCode(text);
                }}
                onFilled={(filledCode) => {
                  // Use the filled code directly to avoid race condition
                  // where state hasn't updated yet with the 6th digit
                  if (__DEV__) {
                    console.debug('[verifyPhone] onFilled called with:', filledCode, 'length:', filledCode.length);
                  }
                  // Ensure we have exactly 6 digits before proceeding
                  if (filledCode && filledCode.length === 6) {
                    setCode(filledCode);
                    // Small delay to ensure state is updated
                    setTimeout(() => {
                      handleVerify(filledCode);
                    }, 50);
                  }
                }}
                textInputProps={{
                  className: "border-gray-300 text-center text-xl font-bold rounded-2xl w-14 h-14 bg-white",
                }}
                textProps={{
                  allowFontScaling: false,
                }}
              />
            </ShakeableView>

            {error && (
              <View className="bg-red-50 px-4 py-3 rounded-2xl mb-5 flex-row items-center border border-red-100">
                <AlertCircle size={18} color="#DC2626" />
                <Text className="text-red-600 flex-1 ml-2 font-mulish text-sm leading-tight">
                  {error}
                </Text>
              </View>
            )}

            {showRateLimitHint && (
              <Text className="text-yellow-600 mb-3 text-center font-mulish">
                Too many requests — try again in {cooldownMinutes} minute{cooldownMinutes > 1 ? 's' : ''}.
              </Text>
            )}

            <PrimaryButton
              title={loading ? "Verifying..." : "Log in"}
              onPress={() => {
                if (__DEV__) {
                  console.debug('[verifyPhone] Button pressed, code:', code, 'length:', code.length);
                }
                handleVerify(code);
              }}
              textClassName="text-white"
              loading={loading}
              disabled={code.length !== 6 || loading}
            />

            <View className="flex flex-row justify-center mt-4">
              {timeLeft > 0 ? (
                <Text className="text-primary-green font-mulish font-medium">
                  Resend in {timeLeft}s
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    try {
                      await sendPhone({ skipNavigation: true });
                    } catch {
                      // error is surfaced via store.error
                    }
                  }}
                >
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
