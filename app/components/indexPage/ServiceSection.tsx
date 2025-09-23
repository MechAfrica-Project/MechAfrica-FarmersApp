import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";

const ServiceSection = () => {
  return (
    <View className="px-10">
      <View className="flex-row justify-between my-6">
        <Text className="text-primary-green text-lg font-mulish font-bold">
          Services
        </Text>
        <Link href="/services" asChild>
          <Text className="text-primary-green underline text-lg font-mulish font-bold">
            {" "}
            See all{" "}
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default ServiceSection;
