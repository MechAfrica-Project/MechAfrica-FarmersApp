// CompletedRequests.tsx
import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import ServiceTicket from "./ServiceTicket";

const CompletedRequests: React.FC = () => {
  const completedRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.completed
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
      {/* <CashCard /> */}

      {completedRequests.length > 0 ? (
        completedRequests.map((request) => (
          <ServiceTicket
            key={request.id}
            fullRequest={request}
            status={request.status}
          />
        ))
      ) : (
        <View className="items-center mt-10">
          <Text className="text-gray-500 font-mulish text-base">
            No completed requests.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default CompletedRequests;
