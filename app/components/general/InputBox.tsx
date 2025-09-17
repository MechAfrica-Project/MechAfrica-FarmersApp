import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MapPin, ChevronDown } from "lucide-react-native";

type InputBoxProps = {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
};

export default function InputBox({
  label,
  value,
  placeholder,
  onPress,
  disabled,
}: InputBoxProps) {
  return (
    <View className="space-y-2">
      <Text className="text-gray-color font-mulish mb-2 mt-8 font-semibold">{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-xl px-3 py-4 ${
          disabled ? "bg-gray-50 border-gray-200" : "bg-gray-100 border-gray-300"
        }`}
      >
        {/* Left icon */}
        <View className="bg-gray-200 p-2 rounded-lg mr-3">
          <MapPin size={18} color="#374151" />
        </View>

        {/* Value */}
        <Text
          className={`flex-1 ${
            value ? "text-gray-800" : "text-gray-400"
          } text-base`}
        >
          {value || placeholder}
        </Text>

        {/* Right chevron */}
        <ChevronDown size={18} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
}
