import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RequestDetailsCard from "../reusable/RequestDetailsCard";
import { Request } from "@/types/request";
import { Text, View } from "react-native";
import { useRequestsStore } from "@/stores/requestsStore";

const OngoingDetailsScreen: React.FC = () => {
  const { request } = useLocalSearchParams();
  const completeRequest = useRequestsStore((s) => s.completeRequest);
  const router = useRouter();

  let parsedRequest: Request | null = null;
  if (request) {
    try {
      parsedRequest = JSON.parse(request as string) as Request;
    } catch (err) {
      console.error("Failed to parse request param:", err);
    }
  }

  if (!parsedRequest) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-600 font-semibold">Request not found</Text>
      </View>
    );
  }

  return (
    <RequestDetailsCard
      request={parsedRequest}
      type="ongoing"
      showActions
      onComplete={() => {
        completeRequest(parsedRequest!.id);
        router.back();
      }}
    />
  );
};

export default OngoingDetailsScreen;
