import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import NotificationBar from "../components/indexPage/NotificationBar";
import WelcomeAndUpdates from "../components/indexPage/WelcomeAndUpdates";

const Index = () => {
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={250} mainColor="#FDFFE0">
      <NotificationBar />
      <WelcomeAndUpdates/>
    </MultiToneBackground>
  );
};

export default Index;
