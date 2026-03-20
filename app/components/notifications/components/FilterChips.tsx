import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { NotificationFilterType } from "@/types/notification";

type Props = {
  active: NotificationFilterType;
  onChange: (val: NotificationFilterType) => void;
};

const FilterChips: React.FC<Props> = ({ active, onChange }) => {
  const keys: { label: string; value: NotificationFilterType }[] = [
    { label: "All", value: "all" },
    { label: "Request", value: "service_request" },
    { label: "System", value: "system_update" },
  ];

  return (
    <View className="flex-row flex-wrap gap-2 mb-3">
      {keys.map(({ label, value }) => {
        const isActive = active === value;
        return (
          <TouchableOpacity
            key={value}
            onPress={() => onChange(value)}
            className={`px-4 py-2 rounded-full ${
              isActive ? "bg-green-700" : "bg-gray-100"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`${
                isActive ? "text-white" : "text-gray-800"
              } font-semibold`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FilterChips;
