import { images } from "@/constants/images";
import { ClosedCaptionIcon, XCircleIcon } from "lucide-react-native";
import React from "react";
import { View, Text, ImageBackground, TouchableOpacity } from "react-native";
import { ProgressBar } from "react-native-paper";

interface ServiceTicketProps {
  serviceName: string;
  serviceSubtitle: string;
  date?: string;
  time?: string;
  status: "sent" | "ongoing" | "completed" | "cancelled";
  providerName?: string;
  daysLeft?: number;
  progress?: number; // value between 0 and 1
  onCancel?: () => void; // callback for cancel button
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
  onCancel,
}) => {
  const getHeaderLabel = () => {
    switch (status) {
      case "sent":
        return "Looking for Provider";
      case "ongoing":
        return providerName || "Provider";
      case "completed":
        return providerName || "Provider";
      case "cancelled":
        return "Cancelled by Admin";
      default:
        return "Provider";
    }
  };

  const getHeaderStyle = () => {
    switch (status) {
      case "sent":
      case "ongoing":
      case "completed":
        return "bg-green-800";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <ImageBackground
      source={images.structure}
      resizeMode="stretch"
      className="w-full relative rounded-xl overflow-hidden p-4 my-2"
    >
      {/* Header */}
      <View className="mb-10">
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-700 font-semibold">Service name</Text>
          <View className={`${getHeaderStyle()} px-3 py-1 rounded-full`}>
            <Text className="text-white text-sm font-semibold">
              {getHeaderLabel()}
            </Text>
          </View>
        </View>

        {/* Service Details */}
        <Text className="text-green-800 font-extrabold text-base mt-2">
          {serviceName}
          <Text className="text-gray-700 font-normal"> {serviceSubtitle}</Text>
        </Text>
      </View>

      {/* Status Section */}
      {status === "sent" && (
        <View className="">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-500">Date requested:</Text>
            <Text className="text-gray-900 font-semibold">
              {date} {time}
            </Text>
          </View>

          {/* Cancel Button */}
          {onCancel && (
            <TouchableOpacity
              onPress={onCancel}
              className="absolute p-1 px-2 bg-red-500 rounded-full  flex-row bottom-9 right-0 self-start"
            >
              {/* <XCircleIcon color="red" height={18} /> */}
              <Text className="text-white">cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {status === "ongoing" && (
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500">Days left:</Text>
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
              backgroundColor: "#facc15", // yellow background
            }}
          />
        </View>
      )}

      {status === "completed" && (
        <View>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-gray-500">Completion Date:</Text>
            <Text className="text-gray-900 font-semibold">{date}</Text>
          </View>
          <ProgressBar
            progress={1}
            color="#facc15"
            style={{
              height: 10,
              borderRadius: 10,
            }}
          />
        </View>
      )}

      {status === "cancelled" && (
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-500">Date requested:</Text>
          <Text className="text-gray-900 font-semibold">
            {date} {time}
          </Text>
        </View>
      )}
    </ImageBackground>
  );
};

export default ServiceTicket;
