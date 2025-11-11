import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type FilterType = "all" | "request" | "system";

type Props = {
  active: FilterType;
  onChange: (val: FilterType) => void;
};

const FilterChips: React.FC<Props> = ({ active, onChange }) => {
  const keys: FilterType[] = ["all", "request", "system"];
  return (
    <View className="flex-row flex-wrap gap-2 mb-3">
      {keys.map((key) => {
        const isActive = active === key;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onChange(key)}
            className={`px-4 py-2 rounded-full ${
              isActive ? "bg-green-700" : "bg-gray-100"
            }`}
            activeOpacity={0.8}
          >
            <Text
              className={`${
                isActive ? "text-white" : "text-gray-800"
              } font-semibold capitalize`}
            >
              {key}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default FilterChips;
