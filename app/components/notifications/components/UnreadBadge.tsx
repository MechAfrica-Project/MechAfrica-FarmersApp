import React from "react";
import { View, Text } from "react-native";

type Props = { count: number };

const UnreadBadge: React.FC<Props> = ({ count }) => {
  return (
    <View className="flex-row items-center mb-2">
      <Text className="text-gray-700 font-semibold">Unread</Text>
      <View className="ml-2 px-2 py-0.5 rounded-full bg-green-100">
        <Text className="text-green-800 text-xs font-bold">{count}</Text>
      </View>
    </View>
  );
};

export default UnreadBadge;


