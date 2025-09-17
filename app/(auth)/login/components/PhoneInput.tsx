import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { COUNTRIES, Country } from "@/constants/countries";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import SelectModal from "@/app/components/general/SelectModal";

export type PhoneValue = {
  raw: string;
  formatted?: string;
  country: string; // ISO code
  valid: boolean;
};

type PhoneInputProps = {
  label?: string;
  countryCode?: Country["code"];
  onChange: (value: PhoneValue) => void;
};

export default function PhoneInput({
  label,
  countryCode = "GH",
  onChange,
}: PhoneInputProps) {
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === countryCode) ?? COUNTRIES[0]
  );
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

      <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-1">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center mr-2"
        >
          <Text className="text-xl mr-1">{selectedCountry.flag}</Text>
          <Text className="text-base text-gray-700">
            {selectedCountry.dialCode}
          </Text>
        </TouchableOpacity>

        <TextInput
          value={phone}
          onChangeText={handleChange}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          className="flex-1 text-base"
        />
      </View>

      {isValid === false && (
        <Text className="text-red-500 mt-1">Invalid phone number</Text>
      )}
      {isValid === true && (
        <Text className="text-green-500 mt-1">✅ Valid number</Text>
      )}

      <SelectModal
        visible={modalVisible}
        title="Select country"
        options={COUNTRIES.map((c) => ({
          label: `${c.flag} ${c.name} (${c.dialCode})`,
          value: c.code,
        }))}
        onSelect={(code) => {
          const country = COUNTRIES.find((c) => c.code === code)!;
          setSelectedCountry(country);
          setPhone("");
          setIsValid(null);
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
