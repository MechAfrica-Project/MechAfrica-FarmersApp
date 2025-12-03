// CompletedRequests.tsx
import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import ServiceTicket from "./ServiceTicket";

const CompletedRequests: React.FC = () => {
  const completedRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.completed
  );
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const horizontalPadding = SCREEN_WIDTH < 360 ? 10 : 16;

  if (completedRequests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-base font-mulish">
          No completed requests.
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
      {completedRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
        />
      ))}
    </View>
  );
};

export default CompletedRequests;
