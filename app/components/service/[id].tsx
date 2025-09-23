import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { servicesData } from "@/constants/servicesData";

const ServiceDetails = () => {
  const { id } = useLocalSearchParams(); // 👈 fetch the dynamic ID
  const router = useRouter();

  // Find the service by ID
  const service = servicesData.find((s) => s.id === id);

  if (!service) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">Service not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FDFFE0] p-4">
      {/* Image */}
      <Image
        source={service.image}
        className="w-full h-52 rounded-2xl"
        resizeMode="cover"
      />

      {/* Title & Subtitle */}
      <Text className="text-[#00796B] font-bold text-2xl mt-4">
        {service.title}
      </Text>
      <Text className="text-gray-600 text-base mb-3">{service.subtitle}</Text>

      {/* Dummy details */}
      <Text className="text-gray-700 mb-6">
        Here you can add a detailed description of the service, how it works,
        pricing, and top providers offering this service.
      </Text>

      {/* Action Button */}
      <TouchableOpacity
        // onPress={() => router.push(`/request/${id}`)}
        className="bg-[#00796B] py-3 rounded-full items-center"
      >
        <Text className="text-white font-semibold text-lg">
          Proceed with Request
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ServiceDetails;
