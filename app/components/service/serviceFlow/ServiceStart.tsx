import { servicesData } from "@/constants/servicesData";
import { useServiceFlowStore } from "@/stores/serviceFlowStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import ServiceDateTimePicker from "./components/ServiceDateTimePicker";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const service = servicesData.find((s) => s.id === id);

  return (
    <ServiceDateTimePicker
      heading="When do you need this service?"
      subtext="Select the date and time you need the service."
      heroImage={service?.image} // Pass service image here
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
