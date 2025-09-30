import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";

const SentRequests = () => {
  return (
    <View>
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="sent"
        date="August 2, 2025"
        time="15:30"
        onCancel={() => console.log("Cancelled service request!")}
      />
    </View>
  );
};

export default SentRequests;
