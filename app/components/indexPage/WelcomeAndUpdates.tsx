import { images } from "@/constants/images";
import { useOnboardingStore } from "@/stores/onboardingStore";
import React from "react";
import { Image, Text, View } from "react-native";

const WelcomeAndUpdates = () => {
  const { data } = useOnboardingStore();
  return (
    <View className="relative flex-row bg-primary-green rounded-3xl mt-6 mx-4 h-[14rem]">
      {/* Left section (text) */}
      <View className="flex-1 justify-between bg-primary-green rounded-3xl p-4">
        <View>
          <Text className="text-white font-mulish font-bold text-2xl">
            Good afternoon,
          </Text>
          <Text className="text-white font-mulish text-xl mb-3">
            Farmer {data.personalInfo.name}
          </Text>
        </View>

        <View className="pr-[10.2rem]">
          <Text className="text-accent-yellow font-mulish font-bold text-base mb-2">
            Tips from MechAfrica
          </Text>
          <Text className="text-white font-mulish text-sm leading-5">
            Your maize should be harvested in the next 2 weeks. Raining season
            will end in Aug. 23, 2025.
          </Text>
        </View>
      </View>

      {/* Right section (farmer + maize) */}

      <Image
        source={images.farmerWelcome}
        className="absolute bottom-0 right-0 z-10"
      />
      <Image
        source={images.cereal}
        className="absolute bottom-0 right-0 "
        height={130}
        width={130}
      />
    </View>
  );
};

export default WelcomeAndUpdates;
