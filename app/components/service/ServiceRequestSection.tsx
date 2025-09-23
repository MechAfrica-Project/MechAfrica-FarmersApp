import { View, Text, Image } from "react-native";
import React from "react";
import { images } from "@/constants/images";
import { useOnboardingStore } from "@/stores/onboardingStore";

const ServiceRequestSection = () => {
  const { data } = useOnboardingStore();
  return (
    <View className="relative flex-row bg-primary-green overflow rounded-3xl mt-[6rem] mx-4 h-[10rem] p-6">
      {/* Left section (text) */}
      <View className="flex-1 justify-between bg-primary-green rounded-3xl">
        <View className="pr-[10.2rem]">
          <Text className="text-accent-yellow font-mulish font-bold text-base mb-2">
            {data.personalInfo.name}, what service do you need?
          </Text>
          <Text className="text-light-yellow font-mulish text-sm leading-5">
            MechAfrica will connect you{"\n"} to a service provider now.
          </Text>
        </View>
      </View>

      {/* Right section */}
      <Image
        source={images.farmer}
        className="absolute bottom-0 right-0 z-10 rounded-3xl"
      />
    </View>
  );
};

export default ServiceRequestSection;
