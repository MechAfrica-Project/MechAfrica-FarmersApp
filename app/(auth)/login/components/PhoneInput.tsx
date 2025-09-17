import React, { useState } from "react";
import { View, Text } from "react-native";
import IntlPhoneInput from "react-native-intl-phone-input";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export type PhoneValue = {
  raw: string;
  formatted?: string;
  country: string;
  valid: boolean;
};

type PhoneInputProps = {
  label?: string;
  onChange: (value: PhoneValue) => void;
};

export default function PhoneInput({ label, onChange }: PhoneInputProps) {
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handlePhoneChange = ({
    phoneNumber,
    dialCode,
    unmaskedPhoneNumber,
  }: any) => {
    const raw = phoneNumber;
    const normalized = raw?.startsWith("+")
      ? raw
      : `${dialCode}${unmaskedPhoneNumber}`;

    const parsed = parsePhoneNumberFromString(normalized);
    const valid = parsed?.isValid() ?? false;

    setIsValid(valid);

    const formatted = valid ? parsed!.formatInternational() : undefined;

    onChange({
      raw: normalized,
      formatted,
      country: dialCode,
      valid,
    });
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}
      <IntlPhoneInput
        onChangeText={handlePhoneChange}
        defaultCountry="GH"
        containerStyle={{
          borderWidth: 1,
          borderColor: isValid === false ? "red" : "#ccc",
          borderRadius: 8,
          padding: 4,
        }}
        phoneInputStyle={{ fontSize: 16, padding: 8 }}
        flagStyle={{
          marginRight: 8,
          borderRadius: 3,
        }}
      />
      {isValid === false && (
        <Text className="text-red-500 mt-1">Invalid phone number</Text>
      )}
      {isValid === true && (
        <Text className="text-green-500 mt-1">✅ Valid number</Text>
      )}
    </View>
  );
}
