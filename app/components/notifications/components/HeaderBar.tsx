import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  title: string;
  onMarkAllRead: () => void;
};

const HeaderBar: React.FC<Props> = ({ title, onMarkAllRead }) => {
  return (
    <View className="flex-row items-center justify-between mb-4">
      <Text className="text-2xl font-extrabold text-green-900">{title}</Text>
      <TouchableOpacity onPress={onMarkAllRead} className="px-3 py-2 rounded-full bg-gray-100">
        <Text className="text-gray-700 font-semibold">Mark all read</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderBar;


