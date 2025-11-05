import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RequestDetailsCard from "../reusable/RequestDetailsCard";
import { useRequestsStore } from "@/stores/requestsStore";
import { Request } from "@/types/request";

const RequestDetailsScreen = () => {
  const router = useRouter();
  const { request } = useLocalSearchParams();
  const parsedRequest: Request | null = request ? JSON.parse(request as string) : null;
  const acceptRequest = useRequestsStore((s) => s.acceptRequest);
  const rejectRequest = useRequestsStore((s) => s.rejectRequest);

  return (
      <RequestDetailsCard
        request={parsedRequest}
        type="pending"
        showActions
        onAccept={() => {
          if (!parsedRequest) return;
          acceptRequest(parsedRequest.id);
          router.replace({
            pathname: "/components/requests/screens/OngoingDetailsScreen",
            params: { request: JSON.stringify({ ...parsedRequest, status: "ongoing" }) },
          });
        }}
        onDecline={() => {
          if (!parsedRequest) return;
          rejectRequest(parsedRequest.id);
          router.replace({
            pathname: "/components/requests/screens/CancelledDetailsScreen",
            params: { request: JSON.stringify({ ...parsedRequest, status: "cancelled" }) },
          });
        }}
      />
  );
};

export default RequestDetailsScreen;
