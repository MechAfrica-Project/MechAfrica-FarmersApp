import { useCatalogStore } from "@/stores/catalogStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { useRouter } from "expo-router";
import React from "react";
import ServiceDateTimePicker from "./components/ServiceDateTimePicker";

const ServiceEnd = () => {
  const router = useRouter();
  const draft = useServiceFlowStore((s) => s.draft);
  const { services } = useCatalogStore();
  const service = services.find((s) => s.id === draft.serviceId);

  return (
    <ServiceDateTimePicker
      heading="When must the work be completed?"
      subtext="Select the date and time you need the service to be completed."
      heroImage={service?.imageUrl ? { uri: service.imageUrl } : undefined}
      onConfirm={(date, time) => {
        const combinedEnd = new Date(date);
        combinedEnd.setHours(time.getHours(), time.getMinutes());

        // persist end date in the draft and navigate to details
        useServiceFlowStore.getState().setEndDate(combinedEnd.toISOString());

        router.push({ pathname: "/components/service/ServiceDetails" });
      }}
    />
  );
};

export default ServiceEnd;
