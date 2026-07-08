import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import RequestDetailsCard from "../reusable/RequestDetailsCard";

const CancelledDetailsScreen: React.FC = () => {
  const { request } = useLocalSearchParams();
  const deleteRequest = useRequestsStore((s) => s.deleteRequest);
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
      type="cancelled"
      showActions
      onDelete={async () => {
        // capture snapshot for undo
        const snapshot = parsedRequest!;
        deleteRequest(snapshot.id).catch(() => {});
        const { default: showToast } = await import('@/lib/toast');
        const restoreRequest = useRequestsStore.getState().restoreRequest;
        showToast({
          type: 'info',
          text1: 'Request deleted',
          visibilityTime: 5000,
          position: 'top',
          props: {
            actions: [
              {
              label: 'Undo',
              onPress: () => {
                try { restoreRequest(snapshot); } catch {}
              },
              style: 'primary',
            },
          ],
          },
        });
        router.back();
      }}
    />
  );
};

export default CancelledDetailsScreen;
