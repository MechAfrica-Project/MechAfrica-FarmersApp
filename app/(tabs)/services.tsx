import { ScrollView } from "react-native";
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import ServiceRequestSection from "../components/service/ServiceRequestSection";

const Services = () => {
  return (
    <MultiToneBackground mainColor="#FDFFE0">
      <ScrollView className="pt-[4rem]">
        <ServiceRequestSection />
      </ScrollView>
    </MultiToneBackground>
  );
};

export default Services;
