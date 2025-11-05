import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RequestDetailsCard from "../reusable/RequestDetailsCard";
import { Request } from "@/types/request";
import { useRequestsStore } from "@/stores/requestsStore";

const OngoingDetailsScreen: React.FC = () => {
  const router = useRouter();
  const { request } = useLocalSearchParams();
  const completeRequest = useRequestsStore((s) => s.completeRequest);

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
    return <p>Error: Request not found</p>; // or show a proper fallback UI
  }


  return (
    <RequestDetailsCard
      request={parsedRequest}
      type="ongoing"
      onAccept={() => {
        if (!parsedRequest) return;
        completeRequest(parsedRequest.id);
        router.replace({
          pathname: "/components/requests/screens/CompletedDetailsScreen",
          params: { request: JSON.stringify({ ...parsedRequest, status: "completed", progress: 1 }) },
        });
      }}
    />
  );
};

export default OngoingDetailsScreen;
