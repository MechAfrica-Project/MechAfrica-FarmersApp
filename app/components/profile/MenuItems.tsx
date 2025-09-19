// components/profile/MenuItem.tsx
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: any;
  label: string;
  danger?: boolean;
  onPress?: () => void;
};

const MenuItem: React.FC<Props> = ({ icon, label, danger, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 rounded-xl border border-gray-color/10 mb-3 mx-4 ${
        danger ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <View className="flex-row items-center gap-4">
        <Ionicons
          name={icon}
          size={20}
          color={danger ? "#ef4444" : "#4b5563"} 
        />
        <Text
          className={
            danger ? "text-red-500 text-base font-medium font-mulish" : "text-gray-color/85 text-base font-mulish font-medium"
          }
        >
          {label}
        </Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color="#9ca3af" />}
    </TouchableOpacity>
  );
};

export default MenuItem;
