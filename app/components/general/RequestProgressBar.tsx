import React from "react";
import { View, Text } from "react-native";
import { ProgressBar } from "react-native-paper";

interface RequestProgressBarProps {
  progress: number;
  daysLeft?: number;
}

const RequestProgressBar: React.FC<RequestProgressBarProps> = ({
  progress,
  daysLeft,
}) => {
  return (
    <View className="mt-4 mb-2">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-gray-600 text-sm font-semibold">Progress</Text>
        {daysLeft !== undefined && (
          <Text className="text-green-800 font-semibold text-sm">
            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
          </Text>
        )}
      </View>
      <ProgressBar
        progress={progress}
        color="#00796B"
        style={{
          height: 10,
          borderRadius: 8,
          backgroundColor: "#FFF3B0",
        }}
      />
    </View>
  );
};

export default RequestProgressBar;
