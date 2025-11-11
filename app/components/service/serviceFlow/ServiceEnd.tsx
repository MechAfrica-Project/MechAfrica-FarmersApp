// ServiceEnd.tsx
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import ServiceDateTimePicker from "./components/ServiceDateTimePicker";
import { servicesData } from "@/constants/servicesData";

const ServiceEnd = () => {
  const router = useRouter();
  const { id, startDate } = useLocalSearchParams();
  const service = servicesData.find((s) => s.id === id);
  return (
    <ServiceDateTimePicker
      heading="When must the work be completed?"
      subtext="Select the date and time you need the service to be completed."
      heroImage={service?.image}
      onConfirm={(date, time) => {
        const combinedEnd = new Date(date);
        combinedEnd.setHours(time.getHours(), time.getMinutes());

        router.push({
          pathname: "/components/service/ServiceDetails",
          params: { id, startDate, endDate: combinedEnd.toISOString() },
        });
      }}
    />
  );
};

export default ServiceEnd;
