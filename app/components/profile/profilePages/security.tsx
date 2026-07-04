import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, ShieldCheck, AlertTriangle, Users } from "lucide-react-native";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

// Reusable component for guidelines
const GuidelineCard = ({ text }: { text: string }) => (
  <BlurView
    intensity={60}
    tint="light"
    className="flex-row items-start p-4 rounded-3xl mb-4 border border-white/60 bg-white/40 overflow-hidden"
  >
    <View className="bg-green-100 p-2.5 rounded-full mr-3 border border-green-200 shadow-sm">
      <ShieldCheck size={20} color="#047857" />
    </View>
    <Text className="text-gray-800 text-sm flex-1 leading-5 font-mulish mt-1">
      {text}
    </Text>
  </BlurView>
);

// Reusable component for action buttons
const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  bgClass = "bg-white/40",
  iconBgClass = "bg-green-100",
  textClass = "text-gray-900",
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
  <TouchableOpacity onPress={onPress} style={{ width: (width / 2) - 20 }} className="mb-4">
    <BlurView
      intensity={60}
      tint="light"
      className={`${bgClass} rounded-3xl p-5 items-center border border-white/60 overflow-hidden`}
    >
      <View className={`${iconBgClass} p-3.5 rounded-full mb-3 border border-white/50 shadow-sm`}>
        <Icon size={24} color={iconColor} />
      </View>
      <Text className={`${textClass} font-bold text-center text-sm font-mulish`}>
        {label}
      </Text>
    </BlurView>
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
    <View className="flex-1 bg-[#F5F7FA]">
      {/* Abstract Background Elements for Premium Feel */}
      <View className="absolute top-[-100] left-[-100] w-64 h-64 bg-green-400/20 rounded-full blur-3xl opacity-60" />
      <View className="absolute top-[20%] right-[-50] w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl opacity-50" />
      <View className="absolute bottom-[-50] left-[20%] w-72 h-72 bg-green-500/10 rounded-full blur-3xl opacity-40" />

      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        {/* Header */}
        <View className="overflow-hidden pb-1">
          <BlurView
            intensity={80}
            tint="light"
            className="px-4 py-3 border-b border-white/40 bg-white/40"
          >
            <View className="flex-row items-center mb-2">
              <TouchableOpacity
                onPress={() => router.back()}
                className="w-10 h-10 items-center justify-center rounded-full bg-white/60 border border-white/80 shadow-sm"
              >
                <ChevronLeft size={22} color="#374151" />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-gray-900 font-mulish ml-3 tracking-tight">
                Security
              </Text>
            </View>
            <Text className="text-gray-600 text-sm font-mulish ml-1">
              Follow these guidelines to keep your farm and transactions safe
            </Text>
          </BlurView>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-4 mt-5">
          {/* Guidelines */}
          {guidelines.map((text, index) => (
            <GuidelineCard key={index} text={text} />
          ))}

          {/* Quick Actions */}
          <Text className="text-gray-900 font-bold mt-6 mb-4 text-lg font-mulish tracking-tight">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <ActionButton 
              icon={AlertTriangle} 
              label="Report Incident" 
              iconBgClass="bg-red-100"
              iconColor="#DC2626"
            />
            <ActionButton 
              icon={Users} 
              label="Verified Providers" 
              iconBgClass="bg-green-100"
              iconColor="#047857"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Security;
