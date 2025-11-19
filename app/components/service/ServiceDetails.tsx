import { servicesData } from "@/constants/servicesData";
import { useFarmerStore } from "@/stores/farmerStore";
import { useRequestsStore } from "@/stores/requestsStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackButton from "../general/BackButton";
import MultiToneBackground from "../general/MultiToneBackground";
import FarmerDetails from "./components/FarmerDetails";
import MessageToProvider from "./components/MessageToProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ServiceDetails = () => {
  const router = useRouter();
  const draft = useServiceFlowStore((s) => s.draft);
  const service = servicesData.find((s) => s.id === draft.serviceId);
  const farms = useFarmerStore((s) => s.farms);
  const profile = useFarmerStore((s) => s.profile);

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
            startDate={draft.startDate}
            endDate={draft.endDate}
            initialFarm={farms[0]}
          />

          {/* Message to Provider */}
          <MessageToProvider />

          {/* Done Button */}
          <TouchableOpacity
            onPress={() => {
              // assemble request from draft and small defaults
              const farmerName = profile?.personalInfo?.name || "Farmer";
              const farmLocation = (farms && farms[0] && farms[0].farmName) || "Unknown farm";

              const newReq: any = {
                serviceId: draft.serviceId || "",
                serviceTitle: service?.title || "",
                serviceDetails: service?.subtitle || "",
                serviceImage: service?.image,
                farmerName,
                farmLocation,
                providerName: "",
                startDateTime: draft.startDate || new Date().toISOString(),
                endDateTime: draft.endDate || new Date().toISOString(),
                progress: 0,
                daysLeft: undefined,
                crop: farms?.[0]?.cropTypes?.[0],
                messageFromFarmer: draft.message,
                voiceNoteUrl: draft.attachments?.[0] ?? null,
              };

              // submit to requests store
              (useRequestsStore.getState() as any).addRequest(newReq);

              // clear flow and navigate
              useServiceFlowStore.getState().clearDraft();
              router.replace("/(tabs)/requests");
            }}
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
