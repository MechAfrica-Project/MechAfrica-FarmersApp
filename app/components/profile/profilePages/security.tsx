import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ShieldCheck, AlertTriangle, Users } from "lucide-react-native";

const { width } = Dimensions.get("window");

// Reusable component for guidelines
const GuidelineCard = ({ text }: { text: string }) => (
  <View className="flex-row items-start bg-white p-4 rounded-2xl shadow-sm mb-3 border border-gray-100">
    <View className="bg-green-50 p-2 rounded-full mr-3 mt-1">
      <ShieldCheck size={20} color="#047857" />
    </View>
    <Text className="text-gray-700 text-sm flex-1 leading-5 font-mulish mt-1">
      {text}
    </Text>
  </View>
);

// Reusable component for action buttons
const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  bgClass = "bg-white",
  iconBgClass = "bg-gray-50",
  textClass = "text-gray-800",
  iconColor = "#047857"
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  bgClass?: string;
  iconBgClass?: string;
  textClass?: string;
  iconColor?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className={`${bgClass} rounded-2xl p-5 mb-3 items-center shadow-sm border border-gray-100`}
    style={{ width: (width / 2) - 24 }}
  >
    <View className={`${iconBgClass} p-3 rounded-full mb-3`}>
      <Icon size={24} color={iconColor} />
    </View>
    <Text className={`${textClass} font-bold text-center text-sm font-mulish`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const Security = () => {
  const router = useRouter();
  const guidelines = [
    "Do not engage service providers off the platform to ensure security.",
    "Verify all service requests and payments through the app.",
    "Report suspicious activity immediately via the Report Incident button.",
    "Keep your personal and farm information confidential.",
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header aligned with Farms screen */}
      <View className="flex-row items-center px-4 pt-14 pb-2">
        <Pressable 
          onPress={() => router.back()} 
          className="mr-3 p-2 bg-white rounded-full shadow-sm"
        >
          <ChevronLeft size={24} color="#374151" />
        </Pressable>
        <Text className="text-2xl font-bold text-gray-900 font-mulish">Security</Text>
      </View>
      <View className="px-4 mb-4">
        <Text className="text-gray-500 text-sm font-mulish">
          Follow these guidelines to keep your farm and transactions safe
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-4 mt-2">
        {/* Guidelines */}
        {guidelines.map((text, index) => (
          <GuidelineCard key={index} text={text} />
        ))}

        {/* Quick Actions */}
        <Text className="text-gray-900 font-bold mt-8 mb-4 text-lg font-mulish">
          Quick Actions
        </Text>
        <View className="flex-row flex-wrap justify-between">
          <ActionButton 
            icon={AlertTriangle} 
            label="Report Incident" 
            iconBgClass="bg-red-50"
            iconColor="#DC2626"
          />
          <ActionButton 
            icon={Users} 
            label="Verified Providers" 
            iconBgClass="bg-green-50"
            iconColor="#047857"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Security;
