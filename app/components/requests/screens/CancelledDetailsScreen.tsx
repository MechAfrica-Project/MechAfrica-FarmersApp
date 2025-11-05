import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RequestDetailsCard from "../reusable/RequestDetailsCard";
import { Request } from "@/types/request";
import { Text, View } from "react-native";
import { useRequestsStore } from "@/stores/requestsStore";

const CancelledDetailsScreen: React.FC = () => {
  const { request } = useLocalSearchParams();
  const deleteRequest = useRequestsStore((s) => s.deleteRequest);
  const router = useRouter();

  // Parse request and type it
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
      type="cancelled"
      onAccept={() => {
        if (!parsedRequest) return;
        deleteRequest(parsedRequest.id);
        router.back();
      }}
    />
  );
};

export default CancelledDetailsScreen;
