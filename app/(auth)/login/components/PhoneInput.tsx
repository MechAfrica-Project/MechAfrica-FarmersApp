import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { COUNTRIES, Country } from "@/constants/countries";
import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

export type PhoneValue = {
  raw: string;
  formatted?: string;
  country: string; // ISO code (GH, NG, etc.)
  valid: boolean;
};

type PhoneInputProps = {
  label?: string;
  countryCode?: Country["code"]; // strictly typed
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
    // Format while typing
    const formatter = new AsYouType(selectedCountry.code);
    const formatted = formatter.input(text);

    setPhone(formatted);

    // Get normalized full international number
    const normalized = formatter.getNumberValue();

    // Validate with libphonenumber-js
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

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setPhone("");
    setIsValid(null);
    setModalVisible(false);
  };

  return (
    <View className="mb-4">
      {label && <Text className="mb-2 font-mulish">{label}</Text>}

      {/* Input Row */}
      <View className="flex-row items-center border p-3 rounded-lg">
        {/* Country Selector */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={{ flexDirection: "row", alignItems: "center", marginRight: 8 }}
        >
          <Text className="text-xl mr-1">{selectedCountry.flag}</Text>
          <Text className="text-base text-gray-700">
            {selectedCountry.dialCode}
          </Text>
        </TouchableOpacity>

        {/* Phone Input */}
        <TextInput
          value={phone}
          onChangeText={handleChange}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          style={{ flex: 1, fontSize: 16 }}
        />
      </View>

      {/* Validation */}
      {isValid === false && (
        <Text className="text-red-500 mt-1">Invalid phone number</Text>
      )}
      {isValid === true && (
        <Text className="text-green-500 mt-1">✅ Valid number</Text>
      )}

      {/* Country Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-center">
          <View className="bg-white rounded-xl mx-6 max-h-[70%] p-4">
            <Text className="font-semibold text-lg mb-3">Select country</Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center py-3 border-b border-gray-200"
                  onPress={() => selectCountry(item)}
                >
                  <Text className="mr-2 text-xl">{item.flag}</Text>
                  <Text className="flex-1 text-base">{item.name}</Text>
                  <Text className="text-gray-600">{item.dialCode}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              className="mt-4 py-3 rounded-lg bg-gray-200"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-center font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
