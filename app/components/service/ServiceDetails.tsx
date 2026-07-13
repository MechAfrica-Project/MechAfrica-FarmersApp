import { useCatalogStore } from "@/stores/catalogStore";
import { useFarmerStore } from "@/stores/farmerStore";
import { useRequestsStore } from "@/stores/requestsStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { toastError } from "@/lib/toast";
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
  const { services } = useCatalogStore();
  const service = services.find((s) => s.id === draft.serviceId);
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
          {service?.imageUrl && (
            <Image
              source={{ uri: service.imageUrl }}
              style={{
                width: SCREEN_WIDTH - 40,
                height: 180,
                borderRadius: 12,
                marginBottom: 20,
              }}
              resizeMode="cover"
            />
          )}

          <Text className="text-[28px] font-bold text-gray-800 mb-1">
            {service?.name}
          </Text>
          <Text className="text-gray-500 mb-6">{service?.description}</Text>

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
              const farmerName = profile?.personalInfo?.firstName || "Farmer";

              // Use selected farm from draft
              const selectedFarm = draft.farmId
                ? farms.find(f => f.id === draft.farmId)
                : null;
                
              if (!selectedFarm) {
                toastError("Required Field", "Please select a farm to proceed.");
                return;
              }
              
              const farmLocation = selectedFarm.farmName || "Unknown farm";

              // Use selected crop from draft
              const selectedCrop = draft.crop;
              
              if (!selectedCrop) {
                toastError("Required Field", "Please select a crop type to proceed.");
                return;
              }

              const newReq: any = {
                serviceId: draft.serviceId || "",
                serviceTitle: service?.name || "",
                serviceDetails: service?.description || "",
                serviceImage: service?.imageUrl ? { uri: service?.imageUrl } : undefined,
                farmerName,
                farmLocation,
                farmLatitude: selectedFarm.latitude,
                farmLongitude: selectedFarm.longitude,
                farmId: selectedFarm.id,
                farmSize: selectedFarm.farmSize,
                providerName: "",
                startDateTime: draft.startDate || new Date().toISOString(),
                endDateTime: draft.endDate || new Date().toISOString(),
                progress: 0,
                daysLeft: undefined,
                crop: selectedCrop,
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
