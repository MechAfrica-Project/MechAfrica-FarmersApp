import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import ServiceTicket from "./ServiceTicket";

const OnGoingRequests: React.FC = () => {
  const ongoingRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.ongoing
  );
  const completeRequest = useRequestsStore((s) => s.completeRequest);
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  // Dynamic horizontal padding based on screen width
  const horizontalPadding = SCREEN_WIDTH < 360 ? 10 : 16;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingTop: 10, paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {ongoingRequests.length > 0 ? (
        ongoingRequests.map((request) => (
          <ServiceTicket
            key={request.id}
            fullRequest={request}
            status={request.status}
            onComplete={() => completeRequest(request.id)}
          />
        ))
      ) : (
        <View className="items-center mt-10">
          <Text className="text-gray-500 font-mulish text-base">
            No ongoing requests.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default OnGoingRequests;
