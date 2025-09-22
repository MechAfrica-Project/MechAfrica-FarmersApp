import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import NotificationBar from "../components/indexPage/NotificationBar";

const Index = () => {
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={280} mainColor="#FDFFE0">
      <NotificationBar />
    </MultiToneBackground>
  );
};

export default Index;
