import { images } from "@/constants/images";
import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { ProgressBar } from "react-native-paper";

interface ServiceTicketProps {
  serviceName: string;
  serviceSubtitle: string;
  date?: string;
  time?: string;
  status: "sent" | "ongoing";
  providerName?: string;
  daysLeft?: number;
  progress?: number; // value between 0 and 1
}

const ServiceTicket: React.FC<ServiceTicketProps> = ({
  serviceName,
  serviceSubtitle,
  date,
  time,
  status,
  providerName,
  daysLeft,
  progress = 0,
}) => {
  return (
    <ImageBackground
      source={images.structure}
      resizeMode="stretch"
      className="w-full rounded-xl overflow-hidden p-4 my-2"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-gray-700 font-semibold">Service name</Text>
        <View className="bg-green-800 px-3 py-1 rounded-full">
          <Text className="text-white text-sm font-semibold">
            {status === "sent"
              ? "looking for Provider"
              : providerName || "Provider"}
          </Text>
        </View>
      </View>

      {/* Service Details */}
      <Text className="text-green-800 font-extrabold text-base">
        {serviceName}
        <Text className="text-gray-700 font-normal"> {serviceSubtitle}</Text>
      </Text>

      {/* Dotted Divider */}
      <View className="border-b border-dashed border-gray-300 my-3" />

      {/* Status Section */}
      {status === "sent" ? (
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500">Date requested:</Text>
          <Text className="text-gray-900 font-semibold">
            {date} {time}
          </Text>
        </View>
      ) : (
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500">Date left:</Text>
            <Text className="text-gray-900 font-semibold">
              {daysLeft} Days left
            </Text>
          </View>
          <ProgressBar
            progress={progress}
            color="#065f46" // dark green
            style={{
              height: 10,
              borderRadius: 10,
              backgroundColor: "#facc15", // yellow
            }}
          />
        </View>
      )}
    </ImageBackground>
  );
};

export default ServiceTicket;
