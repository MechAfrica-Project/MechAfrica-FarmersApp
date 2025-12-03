import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import ServiceTicket from "./ServiceTicket";

const OnGoingRequests: React.FC = () => {
  const ongoingRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.ongoing
  );
  const completeRequest = useRequestsStore((s) => s.completeRequest);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Dynamic horizontal padding based on screen width
  const horizontalPadding = SCREEN_WIDTH < 360 ? 10 : 16;

  if (ongoingRequests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-base font-mulish">
          No ongoing requests.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 10, paddingBottom: 20 }}>
      {ongoingRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
          onComplete={() => completeRequest(request.id)}
        />
      ))}
    </View>
  );
};

export default OnGoingRequests;
