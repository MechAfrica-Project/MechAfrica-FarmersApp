import { ScrollView } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { sampleRequests } from "@/dummy-data/dummy_data";
import { Request } from "@/types/request";

const OnGoingRequests: React.FC = () => {
  // Filter only ongoing requests
  const ongoingRequests: Request[] = sampleRequests.filter(
    (req) => req.status === "ongoing"
  );

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {ongoingRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          serviceName={request.serviceType}
          serviceSubtitle={request.serviceDetails}
          status="ongoing"
          providerName={request.providerName} // show farmer's name
          daysLeft={request.daysLeft}
          progress={request.progress ?? 0} // ensure progress is between 0-1
        />
      ))}
    </ScrollView>
  );
};

export default OnGoingRequests;
