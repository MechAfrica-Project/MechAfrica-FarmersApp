import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import ServiceTicket from "./ServiceTicket";

const CancelledRequests: React.FC = () => {
  // Filter only cancelled requests
  const cancelledRequests: Request[] = useRequestsStore((s) => s.listsByStatus.cancelled);

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {cancelledRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
        />
      ))}
    </ScrollView>
  );
};

export default CancelledRequests;
