import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { servicesData } from "@/constants/servicesData";
import MultiToneBackground from "../general/MultiToneBackground";
import BackButton from "../general/BackButton";
import FarmerDetails from "./FarmerDetails";
import MessageToProvider from "./MessageToProvider";

const ServiceDetails = () => {
  const { id, startDate, startTime, endDate, endTime } = useLocalSearchParams();
  const router = useRouter();

  const service = servicesData.find((s) => s.id === id);

  return (
    <MultiToneBackground topColor="#FFF9D6" topHeight={200} mainColor="#FFFFFF">
      <View className="mt-[5rem] px-10">
        <BackButton />
      </View>
      <ScrollView className="flex-1 pt-8 px-9">
        {/* Image */}
        <Image
          source={service?.image}
          className="w-[22rem] h-[15rem] rounded-2xl mx-auto"
          resizeMode="cover"
        />

        {/* Reusable FarmerDetails */}
        <FarmerDetails
          service={service}
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
        />
        <MessageToProvider />

        {/* Action Button */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/requests")}
          className="bg-[#00796B] py-3 my-12 rounded-full items-center"
        >
          <Text className="text-white font-semibold text-lg">Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </MultiToneBackground>
  );
};

export default ServiceDetails;
