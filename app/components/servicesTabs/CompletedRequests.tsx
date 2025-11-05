import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import CashCard from "./CashCard";
import ServiceTicket from "./ServiceTicket";

const CompletedRequests: React.FC = () => {
  // Filter only completed requests
  const completedRequests: Request[] = useRequestsStore((s) => s.listsByStatus.completed);

  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <CashCard />
      {completedRequests.map((request) => (
        <ServiceTicket key={request.id} fullRequest={request} status={request.status} />
      ))}
    </ScrollView>
  );
};

export default CompletedRequests;
