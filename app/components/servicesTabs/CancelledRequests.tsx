import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView, useWindowDimensions, View, Text } from "react-native";
import ServiceTicket from "./ServiceTicket";

const CancelledRequests: React.FC = () => {
  const cancelledRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.cancelled
  );

  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const horizontalPadding = SCREEN_WIDTH < 360 ? 10 : 16;

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: horizontalPadding,
        paddingTop: 10,
        paddingBottom: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {cancelledRequests.length > 0 ? (
        cancelledRequests.map((request) => (
          <ServiceTicket
            key={request.id}
            fullRequest={request}
            status={request.status}
          />
        ))
      ) : (
        <View className="items-center mt-10">
          <Text className="text-gray-500 font-mulish text-base">
            No cancelled requests.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default CancelledRequests;
