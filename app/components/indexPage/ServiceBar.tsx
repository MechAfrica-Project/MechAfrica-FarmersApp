import { View, Text } from "react-native";
import React from "react";
import { Link } from "expo-router";

const ServiceBar = () => {
  return (
    <View className="flex-row px-10 justify-between my-6">
      <Text className="text-primary-green text-lg font-mulish font-bold">
        Services
      </Text>
      <Link href="/services" asChild>
        <Text className="text-primary-green underline underline-offset  text-lg font-mulish font-bold">
          See all
        </Text>
      </Link>
    </View>
  );
};

export default ServiceBar;
