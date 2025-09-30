import { View, Text } from "react-native";
import React from "react";
import ServiceTicket from "./ServiceTicket";

const OnGoingRequests = () => {
  return (
    <View className="mx-3 w-auto">
      <ServiceTicket
        serviceName="Ripping"
        serviceSubtitle="Land Preparation & Soil Breaking"
        status="ongoing"
        providerName="Mr. Sarfo Kofi"
        daysLeft={29}
        progress={0.7}
      />
    </View>
  );
};

export default OnGoingRequests;
