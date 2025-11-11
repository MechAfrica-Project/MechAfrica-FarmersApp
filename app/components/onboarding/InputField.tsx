import React from "react";
import { View, Text, TextInput, KeyboardTypeOptions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Leaf, Ruler } from "lucide-react-native";

type InputFieldProps = {
  label: string;
  placeholder: string;
  icon: keyof typeof Feather.glyphMap | "leaf" | "ruler";
  value: string;
  onChange: (text: string) => void;
  required?: boolean;
  optional?: boolean;
  focused: string | null;
  setFocused: (field: string | null) => void;
  fieldKey: string;
  error?: boolean;
  keyboardType?: KeyboardTypeOptions;
  allowDecimal?: boolean; // NEW: optional flag for decimal input
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
  error,
  keyboardType = "default",
  allowDecimal = false,
}: InputFieldProps) {
  const renderIcon = () => {
    if (icon === "leaf") {
      return <Leaf size={20} color={error ? "red" : "#6B7280"} />;
    }
    if (icon === "ruler") {
      return <Ruler size={20} color={error ? "red" : "#6B7280"} />;
    }
    return <Feather name={icon} size={20} color={error ? "red" : "#6B7280"} />;
  };

  // Determine keyboard type dynamically
  const getKeyboardType = () => {
    if (allowDecimal) return "decimal-pad";
    return keyboardType;
  };

  return (
    <View className="mb-6">
      <Text className="text-md font-mulish text-gray-600 mb-2">
        {label} {required && <Text className="text-red-500">*</Text>}
        {optional && <Text className="text-gray-400">(optional)</Text>}
      </Text>

      <View
        className={`flex flex-row items-center rounded-xl px-3 py-3 border
          ${
            error
              ? "border-red-500 bg-white"
              : focused === fieldKey
              ? "border-green-500 bg-white"
              : "border-gray-200 bg-gray-50"
          }`}
      >
        {renderIcon()}
        <TextInput
          className="flex-1 py-1 text-gray-900 ml-3"
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => {
            if (allowDecimal) {
              // Only allow numbers and one decimal
              const clean = text.replace(/[^0-9.]/g, ""); // remove invalid chars
              const parts = clean.split(".");
              const newValue =
                parts.length <= 1
                  ? parts[0]
                  : parts[0] + "." + parts.slice(1).join(""); // ignore extra decimals
              onChange(newValue);
            } else {
              onChange(text);
            }
          }}
          onFocus={() => setFocused(fieldKey)}
          onBlur={() => setFocused(null)}
          keyboardType={getKeyboardType()}
          autoCorrect={false}
          contextMenuHidden={allowDecimal}
        />
      </View>

      {error && (
        <Text className="text-red-500 text-sm mt-1">{label} is required</Text>
      )}
    </View>
  );
}
