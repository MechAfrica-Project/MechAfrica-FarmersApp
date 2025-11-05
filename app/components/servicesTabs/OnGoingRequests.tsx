import { ScrollView } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { Request } from "@/types/request";
import { useRequestsStore } from "@/stores/requestsStore";

const OnGoingRequests: React.FC = () => {
  const getByStatus = useRequestsStore((s) => s.getByStatus);
  const completeRequest = useRequestsStore((s) => s.completeRequest);
  // Filter only ongoing requests
  const ongoingRequests: Request[] = getByStatus("ongoing");

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {ongoingRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          fullRequest={request}
          status={request.status}
          onComplete={() => completeRequest(request.id)}
        />
      ))}
    </ScrollView>
  );
};

export default OnGoingRequests;
