import React from "react";
import MultiToneBackground from "@/app/components/general/MultiToneBackground";
import NotificationBar from "@/app/components/indexPage/NotificationBar";
import WelcomeAndUpdates from "@/app/components/indexPage/WelcomeAndUpdates";
import ServicesCarousel from "@/app/components/indexPage/ServicesCarousel";
import { useCatalogStore } from "@/stores/catalogStore";
import ServiceBar from "@/app/components/indexPage/ServiceBar";

const Index = () => {
  const { services } = useCatalogStore();

  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={250} mainColor="#FDFFE0">
      <NotificationBar />
      <WelcomeAndUpdates />
      <ServiceBar />
      <ServicesCarousel services={services} />
    </MultiToneBackground>
  );
};

export default Index;
