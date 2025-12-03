import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { useWindowDimensions, View, Text } from "react-native";
import ServiceTicket from "./ServiceTicket";

const CancelledRequests: React.FC = () => {
  const cancelledRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.cancelled
  );

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const horizontalPadding = SCREEN_WIDTH < 360 ? 10 : 16;

  if (cancelledRequests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-base font-mulish">
          No cancelled requests.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 10,
        paddingBottom: 20,
      }}
    >
      {cancelledRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
        />
      ))}
    </View>
  );
};

export default CancelledRequests;
