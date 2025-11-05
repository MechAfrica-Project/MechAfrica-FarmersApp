import { ScrollView } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import CashCard from "./CashCard";
import { Request } from "@/types/request";
import { useRequestsStore } from "@/stores/requestsStore";

const CompletedRequests: React.FC = () => {
  const getByStatus = useRequestsStore((s) => s.getByStatus);
  // Filter only completed requests
  const completedRequests: Request[] = getByStatus("completed");

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
