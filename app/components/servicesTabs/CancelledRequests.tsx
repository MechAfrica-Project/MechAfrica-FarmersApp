import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";
import { ScrollView } from "react-native-reanimated/lib/typescript/Animated";

const CancelledRequests = () => {
  return (
    <ScrollView className="mx-3 w-auto" showsVerticalScrollIndicator={false}>
      <ServiceTicket
        serviceName="Drone"
        serviceSubtitle="Aerial Spraying & Monitoring"
        date="August 2, 2025"
        time="15:30"
        status="cancelled"
      />
      <ServiceTicket
        serviceName="Drone"
        serviceSubtitle="Aerial Spraying & Monitoring"
        date="August 2, 2025"
        time="15:30"
        status="cancelled"
      />
      <ServiceTicket
        serviceName="Drone"
        serviceSubtitle="Aerial Spraying & Monitoring"
        date="August 2, 2025"
        time="15:30"
        status="cancelled"
      />
      <ServiceTicket
        serviceName="Drone"
        serviceSubtitle="Aerial Spraying & Monitoring"
        date="August 2, 2025"
        time="15:30"
        status="cancelled"
      />
    </ScrollView>
  );
};

export default CancelledRequests;
