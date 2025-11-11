import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import ServiceDateTimePicker from "./components/ServiceDateTimePicker";
import { servicesData } from "@/constants/servicesData";

const ServiceStart = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const service = servicesData.find((s) => s.id === id);

  return (
    <ServiceDateTimePicker
      heading="When you need this service?"
      subtext="Select the date and time you need the service."
      heroImage={service?.image} // Pass service image here
      onConfirm={(date, time) => {
        const combinedStart = new Date(date);
        combinedStart.setHours(time.getHours(), time.getMinutes());

        router.push({
          pathname: "/components/service/serviceFlow/ServiceEnd",
          params: { id, startDate: combinedStart.toISOString() },
        });
      }}
    />
  );
};

export default ServiceStart;
