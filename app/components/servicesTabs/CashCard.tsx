// CashCard.tsx
import { View, Text, Image, useWindowDimensions } from "react-native";
import React from "react";
import { images } from "@/constants/images";

const CashCard = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const padding = SCREEN_WIDTH < 360 ? 16 : 24;
  const cardHeight = SCREEN_WIDTH < 360 ? 120 : 140;

  return (
    <View
      style={{ height: cardHeight }}
      className="relative flex-row bg-primary-green rounded-3xl my-4"
    >
      {/* Left section (text) */}
      <View
        style={{ padding }}
        className="flex-1 justify-between bg-primary-green rounded-3xl"
      >
        <Text className="text-white font-mulish text-sm">
          Records of all transactions
        </Text>
        <View>
          <Text className="text-accent-yellow font-mulish font-bold text-base">
            Total Spent
          </Text>
          <Text className="text-white font-mulish font-bold text-2xl">
            ₵10,000.54
          </Text>
        </View>
      </View>

      {/* Right section (images) */}
      <Image
        source={images.farmerSales}
        className="absolute bottom-0 -right-[3%] z-10"
      />
      <View className="absolute w-full h-full overflow-hidden rounded-3xl">
        <Image source={images.coins} className="bottom-0 left-[48%]" />
        <Image source={images.halfBg} className="absolute bottom-2 -right-5" />
      </View>
    </View>
  );
};

export default CashCard;
