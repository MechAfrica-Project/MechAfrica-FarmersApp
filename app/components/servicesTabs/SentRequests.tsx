import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  const sentRequests: Request[] = useRequestsStore((s) => s.listsByStatus.pending);
  const cancelRequest = useRequestsStore((s) => s.cancelRequest);

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {sentRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
          onCancel={() => cancelRequest(request.id)}
        />
      ))}
    </ScrollView>
  );
};

export default SentRequests;
