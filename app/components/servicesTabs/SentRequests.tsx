import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { View, Text } from "react-native";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  const sentRequests: Request[] = useRequestsStore(
    (s) => s.listsByStatus.pending
  );
  const cancelRequest = useRequestsStore((s) => s.cancelRequest);

  if (sentRequests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-400 text-base">No sent requests yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ paddingVertical: 10 }}>
      {sentRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
          onCancel={() => cancelRequest(request.id)}
        />
      ))}
    </View>
  );
};

export default SentRequests;
