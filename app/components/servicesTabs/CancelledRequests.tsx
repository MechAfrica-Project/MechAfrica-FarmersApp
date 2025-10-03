import { View, ScrollView } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { sampleRequests } from "@/dummy-data/dummy_data";
import { Request } from "@/types/request";

const CancelledRequests: React.FC = () => {
  // Filter only cancelled requests
  const cancelledRequests: Request[] = sampleRequests.filter(
    (req) => req.status === "cancelled"
  );

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {cancelledRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          serviceName={request.serviceType}
          serviceSubtitle={request.serviceDetails}
          date={request.dateRequested}
          status="cancelled"
          cancelledBy={request.cancelledBy}
        />
      ))}
    </ScrollView>
  );
};

export default CancelledRequests;
