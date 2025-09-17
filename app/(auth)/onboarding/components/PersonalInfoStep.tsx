import React, { useState } from "react";
import { View } from "react-native";
import { useOnboardingStore } from "@/stores/onboardingStore";
import PhoneInput from "../../login/components/PhoneInput";
import InputField from "@/app/components/onboarding/InputField";

export default function PersonalInfoStep() {
  const { data, updateData } = useOnboardingStore();
  const [focused, setFocused] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});



  return (
    <View className="p-4 ">
      <View className="mt-10"></View>
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
        error={errors.name}
      />

      {/* Other Names (Optional) */}
      <InputField
        label="Other names"
        placeholder="Enter other names"
        icon="user"
        value={data.personalInfo?.otherNames || ""}
        onChange={(text) => updateData({ personalInfo: { otherNames: text } })}
        optional
        focused={focused}
        setFocused={setFocused}
        fieldKey="otherNames"
      />

      {/* Telephone Number */}

      <PhoneInput
        label="Telephone number"
        onChange={(val) => updateData({ personalInfo: { phone: val } })}
      />
    </View>
  );
}
