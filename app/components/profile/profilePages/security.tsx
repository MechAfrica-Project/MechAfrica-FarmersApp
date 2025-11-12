import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

// Reusable component for guidelines
const GuidelineCard = ({ icon, text }: { icon: string; text: string }) => (
  <View className="flex-row items-start bg-white p-4 rounded-xl shadow mb-3">
    <Ionicons name={icon as any} size={28} color="#10B981" className="mr-3" />
    <Text className="text-gray-700 text-base flex-1">{text}</Text>
  </View>
);

// Reusable component for action buttons
const ActionButton = ({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-green-800 rounded-xl py-4 mb-3 items-center"
    style={{ width: width / 2 - 20 }}
  >
    <Ionicons name={icon as any} size={28} color="white" />
    <Text className="text-white font-semibold mt-2 text-center">{label}</Text>
  </TouchableOpacity>
);

const Security = () => {
  const guidelines = [
    "Do not engage service providers off the platform to ensure security.",
    "Verify all service requests and payments through the app.",
    "Report suspicious activity immediately via the Report Incident button.",
    "Keep your personal and farm information confidential.",
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-green-800 pt-12 pb-5 px-4 rounded-b-3xl">
        <Text className="text-white text-2xl font-bold">Security</Text>
        <Text className="text-white/80 mt-1 text-sm">
          Follow these guidelines to keep your farm and transactions safe
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="px-4 mt-4">
        {/* Guidelines */}
        {guidelines.map((text, index) => (
          <GuidelineCard key={index} icon="shield-checkmark-outline" text={text} />
        ))}

        {/* Quick Actions */}
        <Text className="text-gray-700 font-semibold mt-6 mb-2 text-lg">Quick Actions</Text>
        <View className="flex-row flex-wrap justify-between">
          <ActionButton icon="alert-circle-outline" label="Report Incident" />
          <ActionButton icon="people-outline" label="Verified Service Providers" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Security;
