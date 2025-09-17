import React from "react";
import { View, Text, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";

type InputFieldProps = {
  label: string;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap;
  value: string;
  onChange: (text: string) => void;
  required?: boolean;
  optional?: boolean;
  focused: string | null;
  setFocused: (field: string | null) => void;
  fieldKey: string;
};

export default function InputField({
  label,
  placeholder,
  icon,
  value,
  onChange,
  required,
  optional,
  focused,
  setFocused,
  fieldKey,
}: InputFieldProps) {
  return (
    <View className="mb-6">
      <Text className="text-md font-mulish text-gray-600 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
        {optional && <Text className="text-gray-400">(optional)</Text>}
      </Text>
      <View
        className={`flex-row items-center rounded-xl px-3 py-3 border ${
          focused === fieldKey
            ? "border-green-500 bg-white"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <Feather name={icon} size={20} color="#6B7280" />
        <TextInput
          className="flex-1 text-base text-gray-900 ml-3"
          placeholder={placeholder}
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused(null)}
        />
      </View>
    </View>
  );
}
