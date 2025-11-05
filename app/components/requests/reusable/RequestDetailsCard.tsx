import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import MultiToneBackground from "../../general/MultiToneBackground";
import BackButton from "../../general/BackButton";
import FarmerDetails from "./FarmerDetails";
import MessageFromFarmer from "./MessageFromFarmer";
import RequestProgressBar from "../../general/RequestProgressBar";

interface RequestDetailsCardProps {
  request: any;
  type?: "pending" | "ongoing" | "completed" | "cancelled";
  showActions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const RequestDetailsCard: React.FC<RequestDetailsCardProps> = ({
  request,
  type = "pending",
  showActions = false,
  onAccept,
  onDecline,
}) => {
  const renderActionButtons = () => {
    if (type === "pending") {
      return (
        <View className="flex-row justify-between mt-10 mb-16">
          <TouchableOpacity
            onPress={onDecline}
            className="bg-[#D32F2F] w-[48%] py-3 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-lg">Reject</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onAccept}
            className="bg-[#00796B] w-[48%] py-3 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-lg">Accept</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (type === "ongoing") {
      return (
        <TouchableOpacity
          onPress={onAccept}
          className="bg-[#00796B] py-3 my-12 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Mark as Done</Text>
        </TouchableOpacity>
      );
    }

    // For completed/cancelled requests
    const label = type === "cancelled" || type === "completed" ? "Delete" : "Done";
    return (
      <TouchableOpacity
        onPress={onAccept}
        className="bg-[#00796B] py-3 my-12 rounded-full items-center"
      >
        <Text className="text-white font-semibold text-lg">{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <MultiToneBackground topColor="#FFF9D6" topHeight={200} mainColor="#FFFFFF">
      <View className="mt-[5rem] px-10">
        <BackButton />
      </View>

      <ScrollView className="flex-1 pt-8 px-9">
        {request?.serviceImage && (
          <Image
            source={request.serviceImage}
            className="w-[22rem] h-[15rem] rounded-2xl mx-auto"
            resizeMode="cover"
          />
        )}

        {/* Show Progress Bar for ongoing and completed tasks */}
        {(type === "ongoing" || type === "completed") && (
          <RequestProgressBar
            progress={type === "completed" ? 1 : request?.progress ?? 0}
            daysLeft={request?.daysLeft}
          />
        )}

        {/* Farmer Details */}
        <FarmerDetails service={request} />

        {/* Farmer Message */}
        <MessageFromFarmer request={request} />

        {renderActionButtons()}
      </ScrollView>
    </MultiToneBackground>
  );
};

export default RequestDetailsCard;
