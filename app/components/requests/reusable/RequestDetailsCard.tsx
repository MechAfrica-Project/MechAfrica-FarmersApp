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
  onCancel?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
}

const RequestDetailsCard: React.FC<RequestDetailsCardProps> = ({
  request,
  type = "pending",
  showActions = false,
  onCancel,
  onDelete,
  onComplete,
}) => {
  const renderActionButtons = () => {
    if (!showActions) return null;

    // 🟡 Pending — farmer can only cancel
    if (type === "pending") {
      return (
        <TouchableOpacity
          onPress={onCancel}
          className="bg-[#D32F2F] py-3 my-12 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">
            Cancel Request
          </Text>
        </TouchableOpacity>
      );
    }

    // 🟢 Ongoing — show Mark as Complete
    if (type === "ongoing") {
      return (
        <TouchableOpacity
          onPress={onComplete}
          className="bg-[#388E3C] py-3 my-12 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">
            Mark as Complete
          </Text>
        </TouchableOpacity>
      );
    }

    // 🔴 Completed / Cancelled — allow delete
    if (type === "completed" || type === "cancelled") {
      return (
        <TouchableOpacity
          onPress={onDelete}
          className="bg-[#00796B] py-3 my-12 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Delete</Text>
        </TouchableOpacity>
      );
    }

    return null;
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
