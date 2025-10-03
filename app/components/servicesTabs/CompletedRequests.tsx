import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import CashCard from "./CashCard";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

const CompletedRequests = () => {
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <CashCard />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        date="September 21, 2025"
        status="completed"
        providerName="Mr. Sarfo Kofi"
      />
    </ScrollView>
  );
};

export default CompletedRequests;
