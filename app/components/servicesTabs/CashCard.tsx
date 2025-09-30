import { View, Text, Image } from "react-native";
import React from "react";
import { images } from "@/constants/images";

const CashCard = () => {
  return (
    <View className="relative flex-row bg-primary-green  rounded-3xl my-[1rem] h-[9rem]">
      {/* Left section (text) */}
      <View className="flex-1 justify-between bg-primary-green rounded-3xl p-8">
        <View className="pr-[1.2rem]">
          <Text className="text-white font-mulish text-sm">
            Records of all transactions
          </Text>
          <View className="">
            <Text className="text-accent-yellow font-mulish font-bold text-base">
              Total Spent
            </Text>{" "}
            <Text className="text-white font-mulish font-bold text-2xl">
              ₵10,000.54
            </Text>
          </View>
        </View>
      </View>

      {/* Right section (farmer + maize) */}

      <Image
        source={images.farmerSales}
        className="absolute bottom-0 right-0 z-10"
      />
      <View className="absolute w-full h-full overflow-hidden  rounded-3xl">
        <Image
          source={images.coins}
          className="bottom-0 left-[12rem]"
          height={10}
          width={10}
        />
        <Image source={images.halfBg} className="absolute bottom-0 -right-5" />
      </View>
    </View>
  );
};

export default CashCard;
