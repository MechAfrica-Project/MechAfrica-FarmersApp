import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from "react-native";
import MultiToneBackground from "../../general/MultiToneBackground";
import BackButton from "../../general/BackButton";
import FarmerDetails from "./FarmerDetails";
import MessageFromFarmer from "./MessageFromFarmer";
import RequestProgressBar from "../../general/RequestProgressBar";
import { Phone } from "lucide-react-native";

interface RequestDetailsCardProps {
  request: any;
  type?: "pending" | "ongoing" | "completed" | "cancelled";
  showActions?: boolean;
  onCancel?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onEdit?: () => void;
}

const RequestDetailsCard: React.FC<RequestDetailsCardProps> = ({
  request,
  type = "pending",
  showActions = false,
  onCancel,
  onDelete,
  onComplete,
  onEdit,
}) => {
  const providerPhone = request?.providerPhone; // <-- dynamically fetched when provider accepts

  const renderActionButtons = () => {
    if (!showActions) return null;

    if (type === "pending") {
      return (
        <View className="my-12">
          <TouchableOpacity
            onPress={onCancel}
            className="bg-[#D32F2F] py-3 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-lg">
              Cancel Request
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (type === "ongoing") {
      return (
        <View className="my-12 space-y-5">
          {/* ✅ Call Provider button */}
          {providerPhone && (
            <TouchableOpacity
              onPress={() => Linking.openURL(`tel:${providerPhone}`)}
              className="bg-[#16a34a] py-3 mb-3 rounded-full flex-row items-center justify-center gap-2"
            >
              <Phone size={20} color="white" />
              <Text className="text-white font-semibold text-lg">
                Call Provider
              </Text>
            </TouchableOpacity>
          )}

          {/* ✅ Mark as Complete */}
          <TouchableOpacity
            onPress={onComplete}
            className="bg-[#388E3C] py-3 rounded-full items-center"
          >
            <Text className="text-white font-semibold text-lg">
              Mark as Complete
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

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

        {(type === "ongoing" || type === "completed") && (
          <RequestProgressBar
            progress={type === "completed" ? 1 : request?.progress ?? 0}
            daysLeft={request?.daysLeft}
          />
        )}

        <FarmerDetails service={request} />
        <MessageFromFarmer request={request} onEdit={onEdit} />
        {renderActionButtons()}
      </ScrollView>
    </MultiToneBackground>
  );
};

export default RequestDetailsCard;
