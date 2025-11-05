import { images } from "@/constants/images";
import { Request, RequestStatus } from "@/types/request";
import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

interface ServiceTicketProps {
  fullRequest: Request;
  status: RequestStatus;
  onCancel?: () => void;
  onComplete?: () => void;
}

const ServiceTicket: React.FC<ServiceTicketProps> = ({
  fullRequest,
  status,
  onCancel,
  onComplete,
}) => {
  const router = useRouter();

  const getHeaderLabel = () => {
    switch (status) {
      case "pending":
        return "Looking for Provider";
      case "ongoing":
      case "completed":
        return fullRequest.providerName || "Provider";
      case "cancelled":
        return fullRequest.cancelledBy === "farmer"
          ? "Declined Request"
          : "Cancelled by Admin";
      default:
        return "Provider";
    }
  };

  const getHeaderStyle = () => {
    switch (status) {
      case "pending":
      case "ongoing":
      case "completed":
        return "bg-green-800";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-500";
    }
  };

  const handlePress = () => {
    let path:
      | "/components/requests/screens/OngoingDetailsScreen"
      | "/components/requests/screens/CompletedDetailsScreen"
      | "/components/requests/screens/CancelledDetailsScreen";

    switch (status) {
      case "pending":
        path = "/components/requests/screens/OngoingDetailsScreen";
        break;
      case "ongoing":
        path = "/components/requests/screens/OngoingDetailsScreen";
        break;
      case "completed":
        path = "/components/requests/screens/CompletedDetailsScreen";
        break;
      case "cancelled":
        path = "/components/requests/screens/CancelledDetailsScreen";
        break;
      default:
        return;
    }

    router.push({
      pathname: path,
      params: { request: JSON.stringify(fullRequest) },
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <ImageBackground
        source={images.structure}
        resizeMode="stretch"
        className="w-full relative rounded-xl overflow-hidden p-4 my-2"
      >
        {/* Header */}
        <View className="mb-10">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-700 font-mulish font-semibold">
              Service name
            </Text>
            <View className={`${getHeaderStyle()} px-3 py-1 rounded-full`}>
              <Text className="text-white font-mulish text-sm font-semibold">
                {getHeaderLabel()}
              </Text>
            </View>
          </View>

          <Text className="text-green-800 font-extrabold text-base mt-2">
            {fullRequest.serviceTitle}
            <Text className="text-gray-700 font-normal">
              {" "}
              {fullRequest.serviceDetails}
            </Text>
          </Text>
        </View>

        {/* Pending Section */}
        {status === "pending" && (
          <View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-500 font-mulish">Date requested:</Text>
              <Text className="text-gray-900 font-semibold font-mulish">
                {fullRequest.startDateTime}
              </Text>
            </View>

            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                className="absolute p-1 px-2 bg-red-500 rounded-full flex-row bottom-9 right-0 self-start"
              >
                <Text className="text-white font-mulish">cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ongoing Section */}
        {status === "ongoing" && (
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-500 font-mulish">Days left:</Text>
              <Text className="text-gray-900 font-extrabold font-mulish">
                {fullRequest.daysLeft} Days left
              </Text>
            </View>

            <View className="bg-yellow-400 rounded-lg h-2 w-full overflow-hidden">
              <View
                style={{
                  width: `${Math.min(fullRequest.progress ?? 0, 1) * 100}%`,
                  height: 10,
                  borderRadius: 10,
                  backgroundColor: "#065f46",
                }}
              />
            </View>

            {onComplete && (
              <TouchableOpacity
                onPress={onComplete}
                className="self-end mt-3 px-3 py-1 bg-green-700 rounded-full"
              >
                <Text className="text-white font-mulish">Mark complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Completed Section */}
        {status === "completed" && (
          <View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-500 font-mulish">Completion Date:</Text>
              <Text className="text-gray-900 font-extrabold font-mulish">
                {fullRequest.endDateTime}
              </Text>
            </View>

            <View className="bg-yellow-400 rounded-lg h-2 w-full overflow-hidden">
              <Animatable.View
                animation={{ 0: { width: "0%" }, 1: { width: "100%" } }}
                duration={800}
                useNativeDriver={false}
                style={{
                  height: 10,
                  borderRadius: 10,
                  backgroundColor: "#facc15",
                }}
              />
            </View>
          </View>
        )}

        {/* Cancelled Section */}
        {status === "cancelled" && (
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-500">Date requested:</Text>
            <Text className="text-gray-900 font-extrabold font-mulish">
              {fullRequest.startDateTime}
            </Text>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default ServiceTicket;
