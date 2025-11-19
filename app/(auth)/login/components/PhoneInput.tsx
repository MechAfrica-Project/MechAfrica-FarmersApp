import { COUNTRIES, Country } from "@/constants/countries";
import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";
import React, { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";

export type PhoneValue = {
  raw: string;
  formatted?: string;
  country: string;
  valid: boolean;
};

type PhoneInputProps = {
  label?: string;
  countryCode?: Country["code"];
  value?: PhoneValue;
  onChange: (value: PhoneValue) => void;
};

export default function PhoneInput({
  label,
  countryCode = "GH",
  value,
  onChange,
}: PhoneInputProps) {
  const [phone, setPhone] = useState(value?.formatted || "");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === (value?.country || countryCode)) ??
      COUNTRIES[0]
  );
  const [isValid, setIsValid] = useState<boolean | null>(value?.valid ?? null);

  // 🔄 Sync with parent value if it changes
  useEffect(() => {
    if (value) {
      setPhone(value.formatted || "");
      setSelectedCountry(
        (prev) => COUNTRIES.find((c) => c.code === value.country) ?? prev
      );
      setIsValid(value.valid);
    }
  }, [value]);

  const handleChange = (text: string) => {
    const formatter = new AsYouType(selectedCountry.code);
    const formatted = formatter.input(text);
    setPhone(formatted);

    const normalized = formatter.getNumberValue();
    const parsed = parsePhoneNumberFromString(
      normalized || "",
      selectedCountry.code
    );
    const valid = parsed?.isValid() ?? false;
    setIsValid(valid);

    onChange({
      raw: normalized || text,
      formatted: valid ? parsed!.formatInternational() : formatted,
      country: selectedCountry.code,
      valid,
    });
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}

      <View className="flex flex-row border border-gray-300 rounded-lg px-3 py-1">
        <View className="flex-row items-center mr-2">
          <Text className="text-xl mr-1">{selectedCountry.flag}</Text>
        </View>

        <TextInput
          value={phone}
          onChangeText={handleChange}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          className="text-xl mb-2"
        />
      </View>

      {isValid === false && (
        <Text className="text-red-500 mt-1">Invalid phone number</Text>
      )}
      {isValid === true && (
        <Text className="text-green-500 mt-1">Valid number</Text>
      )}

      {/* Country selection is disabled; only Ghana is supported */}
    </View>
  );
}
