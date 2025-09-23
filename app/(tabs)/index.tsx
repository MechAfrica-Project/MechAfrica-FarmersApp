import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import NotificationBar from "../components/indexPage/NotificationBar";
import WelcomeAndUpdates from "../components/indexPage/WelcomeAndUpdates";
import ServicesCarousel from "../components/indexPage/ServicesCarousel";
import { servicesData } from "@/constants/servicesData";
import { Alert } from "react-native";
import ServiceBar from "../components/indexPage/ServiceBar";

const Index = () => {
  const handleSelectService = (service: any) => {
    Alert.alert("Selected", `You selected ${service.title}`);
    // or navigation.navigate("RequestService", { service })
  };
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={250} mainColor="#FDFFE0">
      <NotificationBar />
      <WelcomeAndUpdates />
      <ServiceBar />
      <ServicesCarousel
        services={servicesData}
        onSelectService={handleSelectService}
      />
    </MultiToneBackground>
  );
};

export default Index;
