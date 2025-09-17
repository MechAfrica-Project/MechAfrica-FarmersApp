import PrimaryButton from "@/app/components/general/PrimaryButton";
import ShakeableView, {
  ShakeableViewRef,
} from "@/app/components/general/ShakeableView";
import { useAuthStore } from "@/stores/authStore";
import React, { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AuthLayout from "./components/AuthLayout";
import OtpInput from "./components/OtpInput";

export default function VerifyPhone() {
  const phone = useAuthStore((s) => s.phone?.formatted || s.phone?.raw || ""); // ✅ display nicely
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
    if (!success) {
      wrapperRef.current?.shake();
    }
    // ✅ redirect/navigation handled in authStore
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
      <View className="mb-32">
        <ShakeableView ref={wrapperRef}>
          <OtpInput length={5} onCodeFilled={setCode} error={!!error} />
        </ShakeableView>

        {error && (
          <Text className="text-red-500 mb-3 text-center font-mulish">
            {error}
          </Text>
        )}

        <PrimaryButton
          title={loading ? "Verifying..." : "Log in"}
          onPress={handleVerify}
          disabled={loading || code.length < 5}
          textClassName="text-white"
        />

        <View className="flex flex-row justify-center mt-2">
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
    </AuthLayout>
  );
}
