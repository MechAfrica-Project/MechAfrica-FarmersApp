import PrimaryButton from "@/app/components/general/PrimaryButton";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";

const RESEND_SECONDS = 30;

export default function PhoneVerificationStep() {
  const phoneValue = useOnboardingStore(
    (s) => s.data.personalInfo?.phone
  );
  const otpVerified = useOnboardingStore(
    (s) => s.data.personalInfo?.otpVerified
  );
  const updateData = useOnboardingStore((s) => s.updateData);

  const setAuthPhone = useAuthStore((s) => s.setPhone);
  const sendPhone = useAuthStore((s) => s.sendPhone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const loading = useAuthStore((s) => s.loading);
  const globalError = useAuthStore((s) => s.error);
  const otpCooldownUntil = useAuthStore((s) => s.otpCooldownUntil);

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [autoRequested, setAutoRequested] = useState(false);

  const phoneDisplay = phoneValue?.formatted || phoneValue?.raw || "";
  const cooldownRemaining = otpCooldownUntil ? Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000)) : 0;
  const showRateLimitHint = cooldownRemaining > 60 || (!!globalError && /Try again in/i.test(globalError));
  const cooldownMinutes = Math.ceil(cooldownRemaining / 60);

  useEffect(() => {
    if (phoneValue?.valid) {
      setAuthPhone(phoneValue);
    }
  }, [phoneValue, setAuthPhone]);

  const handleSendCode = useCallback(async () => {
    if (!phoneValue?.valid) {
      setLocalError(
        "Please provide a valid phone number in the previous step."
      );
      return;
    }
    setLocalError(null);
    updateData({ personalInfo: { otpVerified: false } });
    try {
      await sendPhone({ skipNavigation: true });
      setTimeLeft(RESEND_SECONDS);
    } catch (err: any) {
      setLocalError(err?.message ?? "Failed to send code. Try again.");
    }
  }, [phoneValue, sendPhone, updateData]);

  useEffect(() => {
    if (!autoRequested && phoneValue?.valid) {
      setAutoRequested(true);
      handleSendCode();
    }
  }, [autoRequested, phoneValue, handleSendCode]);

  // sync local countdown with store cooldown
  useEffect(() => {
    if (!otpCooldownUntil) return;
    const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
    setTimeLeft(remaining);
  }, [otpCooldownUntil]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = useCallback(
    async (overrideCode?: string) => {
      const codeToUse = overrideCode ?? code;
      if (!codeToUse || codeToUse.length < 6) {
        setLocalError("Please enter the full verification code.");
        return;
      }
      setLocalError(null);
      const success = await verifyOtp(codeToUse, { skipNavigation: true });
    if (success) {
      updateData({ personalInfo: { otpVerified: true } });
    } else {
      updateData({ personalInfo: { otpVerified: false } });
    }
    },
    [code, updateData, verifyOtp]
  );

  return (
    <View className="mt-6">
      <Text className="text-gray-600 text-center mb-4 font-mulish">
        {phoneDisplay
          ? `Enter the 6-digit code we sent to ${phoneDisplay}.`
          : "Go back and add your phone number so we can send you a code."}
      </Text>

      <View className="items-center mb-6">
        <OtpInput
          numberOfDigits={6}
          type="numeric"
          focusColor="#10B981"
          hideStick
          onTextChange={setCode}
          onFilled={(val) => {
            setCode(val);
            handleVerify(val);
          }}
          textInputProps={{
            className:
              "border-gray-300 text-center text-xl font-bold rounded-2xl w-14 h-14 bg-white mx-1",
          }}
          textProps={{
            allowFontScaling: false,
          }}
        />
      </View>

      {(localError || globalError) && (
        <Text className="text-red-500 text-center mb-3 font-mulish">
          {localError || globalError}
        </Text>
      )}

      {showRateLimitHint && (
        <Text className="text-yellow-600 text-center mb-3 font-mulish">
          Too many requests — try again in {cooldownMinutes} minute{cooldownMinutes > 1 ? 's' : ''}.
        </Text>
      )}

      {otpVerified && (
        <Text className="text-green-600 text-center mb-3 font-mulish">
          Phone number verified!
        </Text>
      )}

      <PrimaryButton
        title={otpVerified ? "Verified" : "Verify code"}
        onPress={handleVerify}
        disabled={loading || otpVerified}
        loading={loading}
        textClassName="text-white"
      />

      <View className="flex flex-row justify-center mt-4">
        {timeLeft > 0 ? (
            <Text className="text-primary-green font-mulish font-medium">
              Resend in {timeLeft}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleSendCode} disabled={loading}>
              <Text className="text-primary-green font-mulish font-medium underline">
                {autoRequested ? "Send code again" : "Send code"}
              </Text>
            </TouchableOpacity>
          )}
      </View>
    </View>
  );
}

