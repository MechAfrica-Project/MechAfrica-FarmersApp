import { ScrollView } from "react-native";
import React from "react";
import { sampleRequests } from "@/dummy-data/dummy_data";
import { Request } from "@/types/request";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  // Filter only ongoing requests
  const SentRequests: Request[] = sampleRequests.filter(
    (req) => req.status === "sent"
  );
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {SentRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          serviceName={request.serviceType}
          serviceSubtitle={request.serviceDetails}
          date={request.dateCompleted ?? request.dateRequested}
          status="sent"
        />
      ))}
    </ScrollView>
  );
};

export default SentRequests;
