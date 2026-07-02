import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";

type Props = {
  title: string;
  onMarkAllRead: () => void;
};

const HeaderBar: React.FC<Props> = ({ title, onMarkAllRead }) => {
  const router = useRouter();
  
  return (
    <View className="flex-row items-center justify-between mb-4 mt-2">
      <View className="flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mr-3 p-2 bg-white rounded-full shadow-sm"
          activeOpacity={0.6}
        >
          <ChevronLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold text-green-900">{title}</Text>
      </View>
      <TouchableOpacity onPress={onMarkAllRead} className="px-3 py-2 rounded-full bg-gray-100">
        <Text className="text-gray-700 font-semibold">Mark all read</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HeaderBar;


