import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

const SentRequests = () => {
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
    </ScrollView>
  );
};

export default SentRequests;
