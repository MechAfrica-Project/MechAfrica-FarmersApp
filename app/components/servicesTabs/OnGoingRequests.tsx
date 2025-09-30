import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

const OnGoingRequests = () => {
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
    </ScrollView>
  );
};

export default OnGoingRequests;
