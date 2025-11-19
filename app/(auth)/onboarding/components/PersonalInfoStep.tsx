import InputField from "@/app/components/onboarding/InputField";
import { useOnboardingStore } from "@/stores/onboardingStore";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PhoneInput from "../../login/components/PhoneInput";

export default function PersonalInfoStep() {
  const { data, updateData } = useOnboardingStore();
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
            {/* Full Name */}
            <InputField
              label="Full name"
              placeholder="Enter your full name"
              icon="user"
              value={data.personalInfo?.name || ""}
              onChange={(text) => updateData({ personalInfo: { name: text } })}
              required
              focused={focused}
              setFocused={setFocused}
              fieldKey="name"
                  error={false}
            />

            {/* Other Names (Optional) */}
            <InputField
              label="Other names"
              placeholder="Enter other names"
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
              onChange={(val) =>
                updateData({
                  personalInfo: {
                    ...data.personalInfo,
                    phone: val,
                  },
                })
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
