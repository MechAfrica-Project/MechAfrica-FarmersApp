import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import NotificationBar from "../components/indexPage/NotificationBar";
import WelcomeAndUpdates from "../components/indexPage/WelcomeAndUpdates";
import ServiceSection from "../components/indexPage/ServiceSection";

const Index = () => {
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={250} mainColor="#FDFFE0">
      <NotificationBar />
      <WelcomeAndUpdates />
      <ServiceSection />
    </MultiToneBackground>
  );
};

export default Index;
