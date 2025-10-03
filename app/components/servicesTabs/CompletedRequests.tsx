import { ScrollView } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import CashCard from "./CashCard";
import { sampleRequests } from "@/dummy-data/dummy_data";
import { Request } from "@/types/request";

const CompletedRequests: React.FC = () => {
  // Filter only completed requests
  const completedRequests: Request[] = sampleRequests.filter(
    (req) => req.status === "completed"
  );

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <CashCard />
      {completedRequests.map((request) => (
        <ServiceTicket
          key={request.id}
          serviceName={request.serviceType}
          serviceSubtitle={request.serviceDetails}
          date={request.dateCompleted ?? request.dateRequested}
          status="completed"
          providerName={request.providerName}
        />
      ))}
    </ScrollView>
  );
};

export default CompletedRequests;
