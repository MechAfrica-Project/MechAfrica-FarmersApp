import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  const sentRequests: Request[] = useRequestsStore((s) => s.listsByStatus.pending);
  const rejectRequest = useRequestsStore((s) => s.rejectRequest);
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {sentRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
          onCancel={() => rejectRequest(request.id)}
        />
      ))}
    </ScrollView>
  );
};

export default SentRequests;
