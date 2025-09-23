import { ScrollView } from "react-native";
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import ServiceRequestSection from "../components/service/ServiceRequestSection";
import SearchService from "../components/service/SearchService";

const Services = () => {
  return (
    <MultiToneBackground mainColor="#FDFFE0">
      <ScrollView className="pt-[4rem]">
        <ServiceRequestSection />
        <SearchService />
      </ScrollView>
    </MultiToneBackground>
  );
};

export default Services;
