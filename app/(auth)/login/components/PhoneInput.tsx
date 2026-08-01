import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { COUNTRIES, Country } from "@/constants/countries";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";
import SelectModal from "@/app/components/general/SelectModal";
import { ChevronDown } from "lucide-react-native";
import { Image } from "expo-image";

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
  const [modalVisible, setModalVisible] = useState(false);

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

  const getPlaceholder = () => {
    switch (selectedCountry.code) {
      case "GH":
        return "e.g. 24 123 4567";
      case "NG":
        return "e.g. 803 123 4567";
      default:
        return "Enter phone number";
    }
  };

  const getFlagUrl = (code: string) =>
    `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}

      <View className="flex flex-row items-center border border-gray-300 rounded-lg px-3 py-1">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center mr-2 border-r border-gray-200 pr-2.5 py-1"
        >
          <Image
            source={{ uri: getFlagUrl(selectedCountry.code) }}
            style={{ width: 22, height: 15, borderRadius: 2 }}
            contentFit="cover"
            className="mr-1.5"
          />
          <Text className="text-sm font-mulish font-semibold text-gray-700 mr-1">
            {" "} {selectedCountry.dialCode}
          </Text>
          <ChevronDown size={14} color="#6B7280" />
        </TouchableOpacity>

        <TextInput
          value={phone}
          onChangeText={handleChange}
          placeholder={getPlaceholder()}
          keyboardType="phone-pad"
          className="text-lg flex-1 font-mulish text-gray-900 py-1"
        />
      </View>

      {isValid === false && (
        <Text className="text-red-500 mt-1 font-mulish text-sm">
          Please enter a valid {selectedCountry.name} phone number
        </Text>
      )}
      {isValid === true && (
        <Text className="text-green-500 mt-1 font-mulish text-sm">Valid number</Text>
      )}

      <SelectModal
        visible={modalVisible}
        title="Select country"
        options={COUNTRIES.map((c) => ({
          label: `${c.name} (${c.dialCode})`,
          value: c.code,
          icon: (
            <Image
              source={{ uri: getFlagUrl(c.code) }}
              style={{ width: 24, height: 16, borderRadius: 2 }}
              contentFit="cover"
            />
          ),
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
