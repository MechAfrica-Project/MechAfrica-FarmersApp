import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import CashCard from "./CashCard";

const CompletedRequests = () => {
  return (
    <View className="mx-3 w-auto">
      <CashCard />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
    </View>
  );
};

export default CompletedRequests;
