import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";

const CancelledRequests = () => {
  return (
    <View>
      <ServiceTicket
        serviceName="Drone"
        serviceSubtitle="Aerial Spraying & Monitoring"
        date="August 2, 2025"
        time="15:30"
        status="cancelled"
      />
    </View>
  );
};

export default CancelledRequests;
