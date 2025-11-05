import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import React from "react";
import { ScrollView } from "react-native";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  const getByStatus = useRequestsStore((s) => s.getByStatus);
  // Filter only pending requests (formerly "sent")
  const sentRequests: Request[] = getByStatus("pending");
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      {sentRequests.map((request) => (
        <ServiceTicket key={request.id} fullRequest={request} status={request.status} />
      ))}
    </ScrollView>
  );
};

export default SentRequests;
