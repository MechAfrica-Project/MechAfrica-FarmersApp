import React, { useRef, useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import ShakeableView, {
  ShakeableViewRef,
} from "@/app/components/general/ShakeableView";
import AuthLayout from "@/app/components/authScreens/AuthLayout";
import OtpInput from "@/app/components/authScreens/OtpInput";
import PrimaryButton from "@/app/components/general/PrimaryButton";

export default function VerifyPhone() {
  const phone = useAuthStore((s) => s.phone);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);

  const [code, setCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const wrapperRef = useRef<ShakeableViewRef>(null);

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
    // ✅ no navigation needed here — authStore handles redirect
  };

  return (
    <AuthLayout
      backHref="/(auth)/login/signIn"
      title="Verify your phone"
      subtitle={
        <Text style={{ color: "#6b7280", fontSize: 16, textAlign: "center" }}>
          Please find a 5 digit code sent to{" "}
          <Text style={{ fontWeight: "600" }}>{phone}</Text>
        </Text>
      }
    >
      <View style={{ marginBottom: 32 }}>
        <ShakeableView ref={wrapperRef}>
          <OtpInput length={5} onCodeFilled={setCode} error={!!error} />
        </ShakeableView>

        {error && (
          <Text
            style={{
              color: "#ef4444",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        )}

        <PrimaryButton title="Log in" onPress={() => handleVerify()} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 16,
          }}
        >
          {timeLeft > 0 ? (
            <Text style={{ color: "#6b7280" }}>Resend in {timeLeft}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setTimeLeft(30)}>
              <Text style={{ color: "#10B981", fontWeight: "600" }}>
                Send code again
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </AuthLayout>
  );
}
