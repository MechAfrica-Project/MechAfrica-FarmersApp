import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import NotificationBar from "../components/indexPage/NotificationBar";
import WelcomeAndUpdates from "../components/indexPage/WelcomeAndUpdates";
import ServicesCarousel from "../components/indexPage/ServicesCarousel";
import { servicesData } from "@/constants/servicesData";
import ServiceBar from "../components/indexPage/ServiceBar";
import { useRouter } from "expo-router";

const Index = () => {
  const router = useRouter();
  
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={250} mainColor="#FDFFE0">
      <NotificationBar />
      <WelcomeAndUpdates />
      <ServiceBar />
      <ServicesCarousel
        services={servicesData}
      />
    </MultiToneBackground>
  );
};

export default Index;
