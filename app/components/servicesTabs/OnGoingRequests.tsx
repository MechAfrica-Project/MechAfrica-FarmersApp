import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import ServiceTicket from "./ServiceTicket";

const OnGoingRequests: React.FC = () => {
  const ongoingRequests: Request[] = useRequestsStore((s) => s.listsByStatus.ongoing);
  const completeRequest = useRequestsStore((s) => s.completeRequest);

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
