import InputField from "@/app/components/onboarding/InputField";
import { useAuthStore } from "@/stores/authStore";
import { useOnboardingStore } from "@/stores/onboardingStore";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "@/app/(auth)/login/components/PhoneInput";

export default function PersonalInfoStep() {
  const { data, updateData } = useOnboardingStore();
  const setAuthPhone = useAuthStore((s) => s.setPhone);
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-[8%] pb-10">
            {/* First Name */}
            <InputField
              label="First name"
              placeholder="Enter your first name"
              icon="user"
              value={data.personalInfo?.firstName || ""}
              onChange={(text) =>
                updateData({ personalInfo: { firstName: text } })
              }
              required
              focused={focused}
              setFocused={setFocused}
              fieldKey="firstName"
              error={false}
            />

            {/* Last Name */}
            <InputField
              label="Last name"
              placeholder="Enter your last name"
              icon="user"
              value={data.personalInfo?.lastName || ""}
              onChange={(text) =>
                updateData({ personalInfo: { lastName: text } })
              }
              required
              focused={focused}
              setFocused={setFocused}
              fieldKey="lastName"
              error={false}
            />

            {/* Other Names (Optional) */}
            <InputField
              label="Other names"
              placeholder="Enter other names (optional)"
              icon="user"
              value={data.personalInfo?.otherNames || ""}
              onChange={(text) =>
                updateData({ personalInfo: { otherNames: text } })
              }
              optional
              focused={focused}
              setFocused={setFocused}
              fieldKey="otherNames"
            />

            {/* Telephone Number */}
            <PhoneInput
              label="Telephone number"
              onChange={(val) => {
                updateData({
                  personalInfo: {
                    ...data.personalInfo,
                    phone: val,
                    otpVerified: false,
                  },
                });
                setAuthPhone(val);
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
