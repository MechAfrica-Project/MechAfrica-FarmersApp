import { useCatalogStore } from "@/stores/catalogStore";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import ServiceDateTimePicker from "./components/ServiceDateTimePicker";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const { services } = useCatalogStore();
  const service = services.find((s) => s.id === id);

  return (
    <ServiceDateTimePicker
      heading="When do you need this service?"
      subtext="Select the date and time you need the service."
      heroImage={service?.imageUrl ? { uri: service.imageUrl } : undefined} // Pass service image here
      onConfirm={(date, time) => {
        const combinedStart = new Date(date);
        combinedStart.setHours(time.getHours(), time.getMinutes());

        // Save draft to global service flow store so subsequent steps can read it
        useServiceFlowStore.getState().setServiceId(id as string);
        useServiceFlowStore.getState().setStartDate(combinedStart.toISOString());

        router.push({ pathname: "/components/service/serviceFlow/ServiceEnd" });
      }}
    />
  );
};

export default ServiceStart;
