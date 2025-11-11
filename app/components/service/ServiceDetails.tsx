import { servicesData } from "@/constants/servicesData";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import BackButton from "../general/BackButton";
import MultiToneBackground from "../general/MultiToneBackground";
import FarmerDetails from "./components/FarmerDetails";
import MessageToProvider from "./components/MessageToProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ServiceDetails = () => {
  const { id, startDate, startTime, endDate, endTime } = useLocalSearchParams();
  const router = useRouter();

  const service = servicesData.find((s) => s.id === id);

  return (
    <MultiToneBackground topColor="#FFF9D6" topHeight={200} mainColor="#FFFFFF">
      <SafeAreaView className="flex-1">
        <View className="mt-5 px-5">
          <BackButton />
        </View>

        <ScrollView
          contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20 }}
        >
          {/* Service Image */}
          {service?.image && (
            <Image
              source={service.image}
              style={{
                width: SCREEN_WIDTH * 0.9,
                height: SCREEN_WIDTH * 0.6,
                borderRadius: 20,
                alignSelf: "center",
              }}
              resizeMode="cover"
            />
          )}

          {/* Farmer Details */}
          <FarmerDetails
            service={service}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
          />

          {/* Message to Provider */}
          <MessageToProvider />

          {/* Done Button */}
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)/requests")}
            className="bg-teal-700 py-4 rounded-full items-center mt-8"
          >
            <Text className="text-white font-semibold text-lg">Done</Text>
          </TouchableOpacity>
          <View className="h-40" />
        </ScrollView>
      </SafeAreaView>
    </MultiToneBackground>
  );
};

export default ServiceDetails;
