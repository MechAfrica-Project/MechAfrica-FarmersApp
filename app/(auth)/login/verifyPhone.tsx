import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AuthLayout from "@/app/components/authScreens/AuthLayout";
import OtpInput from "@/app/components/authScreens/OtpInput";
import PrimaryButton from "@/app/components/general/PrimaryButton";
import ShakeableView, { ShakeableViewRef } from "@/app/components/general/ShakeableView";

export default function VerifyPhone() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const wrapperRef = useRef<ShakeableViewRef>(null);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleVerify = async () => {
    if (code.length === 5 && !loading) {
      try {
        setLoading(true);
        setError("");
        const success = code === "12345";
        if (!success) {
          setError("Invalid OTP, please try again.");
          wrapperRef.current?.shake();
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResend = () => {
    setTimeLeft(30);
    setError("");
    setCode("");
    // API: resend OTP to phone
  };

  return (
    <AuthLayout
      backHref="/(auth)/login/signIn"
      title="Verify your phone"
      subtitle={
        <Text className="text-gray-color text-base font-mulish text-center">
          Please find a 5 digit code sent to{" "}
          <Text className="font-semibold">{phone}</Text>
        </Text>
      }
    >
      <View className="mb-8">
        <ShakeableView ref={wrapperRef}>
          <OtpInput length={5} onCodeFilled={setCode} error={!!error} />
        </ShakeableView>

        {error ? (
          <Text className="text-red-500 mb-3 text-center">{error}</Text>
        ) : null}

        <PrimaryButton
          title={loading ? "Verifying..." : "Verify"}
          onPress={handleVerify}
        />

        <View className="flex-row justify-center mt-4">
          {timeLeft > 0 ? (
            <Text className="text-gray-color">Resend in {timeLeft}s</Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text className="text-primary-green font-semibold">
                Send code again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AuthLayout>
  );
}
