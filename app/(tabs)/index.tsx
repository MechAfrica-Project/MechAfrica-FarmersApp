import { Text } from "react-native";
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";

const Index = () => {
  return (
    <MultiToneBackground topColor="#FCFF3B" topHeight={280} mainColor="#FDFFE0">
      <Text className="text-center text-lg font-bold mt-20">Index tab</Text>
    </MultiToneBackground>
  );
};

export default Index;
