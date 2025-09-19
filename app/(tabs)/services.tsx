import { ScrollView, Text } from "react-native";
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";

const Services = () => {
  return (
    <MultiToneBackground mainColor="#FDFFE0">
      <ScrollView className="pt-[4rem]">
        <Text className="text-center text-lg font-bold ">Service tab</Text>
      </ScrollView>
    </MultiToneBackground>
  );
};

export default Services;
