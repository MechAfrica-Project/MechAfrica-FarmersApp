import { images } from "@/constants/images";
import { Request, RequestStatus } from "@/types/request";
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { formatDate } from "../../../utils/formatDate";

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
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Scale values based on screen width
  const fontSize = SCREEN_WIDTH < 360 ? 12 : 14;
  const smallFontSize = SCREEN_WIDTH < 360 ? 10 : 12;
  const spacing = SCREEN_WIDTH < 360 ? 6 : 10;
  const progressHeight = SCREEN_WIDTH < 360 ? 6 : 10;

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
      | "/components/requests/screens/RequestDetailsScreen"
      | "/components/requests/screens/OngoingDetailsScreen"
      | "/components/requests/screens/CompletedDetailsScreen"
      | "/components/requests/screens/CancelledDetailsScreen";

    switch (status) {
      case "pending":
        path = "/components/requests/screens/RequestDetailsScreen";
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
        <View style={{ marginBottom: spacing * 2 }}>
          <View className="flex-row justify-between items-center">
            <Text
              className="text-gray-700 font-mulish font-semibold"
              style={{ fontSize }}
            >
              Service name
            </Text>
            <View className={`${getHeaderStyle()} px-3 py-1 rounded-full`}>
              <Text
                className="text-white font-mulish font-semibold"
                style={{ fontSize: smallFontSize }}
              >
                {getHeaderLabel()}
              </Text>
            </View>
          </View>

          <Text
            className="text-green-800 font-extrabold mt-2"
            style={{ fontSize }}
          >
            {fullRequest.serviceTitle}
            <Text className="text-gray-700 font-normal">
              {" "}
              {fullRequest.serviceDetails}
            </Text>
          </Text>
        </View>

        {/* Pending */}
        {status === "pending" && (
          <View className="flex-row justify-between items-center my-3">
            <Text className="text-gray-500 font-mulish" style={{ fontSize }}>
              Date requested:
            </Text>
            <Text
              className="text-gray-900 font-semibold font-mulish"
              style={{ fontSize }}
            >
              {formatDate(fullRequest.startDateTime)}
            </Text>
            {onCancel && (
              <TouchableOpacity
                onPress={onCancel}
                className="absolute p-1 mb-3 px-2 bg-red-500 rounded-full"
                style={{ bottom: spacing, right: spacing }}
              >
                <Text
                  className="text-white font-mulish"
                  style={{ fontSize: smallFontSize }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Ongoing */}
        {status === "ongoing" && (
          <View >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-500 font-mulish" style={{ fontSize }}>
                Days left:
              </Text>
              <Text
                className="text-gray-900 font-extrabold font-mulish"
                style={{ fontSize }}
              >
                {fullRequest.daysLeft} Days left
              </Text>
            </View>

            <View
              className="bg-yellow-400 rounded-lg w-full overflow-hidden mb-2"
              style={{ height: progressHeight }}
            >
              <View
                style={{
                  width: `${Math.min(fullRequest.progress ?? 0, 1) * 100}%`,
                  height: progressHeight,
                  borderRadius: progressHeight,
                  backgroundColor: "#065f46",
                }}
              />
            </View>

            {onComplete && (
              <TouchableOpacity className="self-end mt-3 px-3 py-1 bg-green-700 rounded-full">
                <Text
                  className="text-white font-mulish"
                  style={{ fontSize: smallFontSize }}
                >
                  Mark complete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Completed */}
        {status === "completed" && (
          <View style={{ marginTop: spacing }}>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-gray-500 font-mulish" style={{ fontSize }}>
                Completion Date:
              </Text>
              <Text
                className="text-gray-900 font-extrabold font-mulish"
                style={{ fontSize }}
              >
                {formatDate(fullRequest.endDateTime)}
              </Text>
            </View>

            <View
              className="bg-yellow-400 rounded-lg w-full overflow-hidden"
              style={{ height: progressHeight }}
            >
              <Animatable.View
                animation={{ 0: { width: "0%" }, 1: { width: "100%" } }}
                duration={800}
                useNativeDriver={false}
                style={{
                  height: progressHeight,
                  borderRadius: progressHeight,
                  backgroundColor: "#facc15",
                }}
              />
            </View>
          </View>
        )}

        {/* Cancelled */}
        {status === "cancelled" && (
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-gray-500 font-mulish" style={{ fontSize }}>
              Date requested:
            </Text>
            <Text
              className="text-gray-900 font-extrabold font-mulish"
              style={{ fontSize }}
            >
              {formatDate(fullRequest.startDateTime)}
            </Text>
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default ServiceTicket;
