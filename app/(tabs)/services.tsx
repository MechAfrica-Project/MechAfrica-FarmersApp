import { servicesData } from "@/constants/servicesData";
import { useUIStore } from "@/stores/uiStore";
import React from "react";
import { FlatList } from "react-native";
import MultiToneBackground from "@/app/components/general/MultiToneBackground";
import SearchService from "@/app/components/service/components/SearchService";
import ServiceHeader from "@/app/components/service/components/ServiceHeader";

const Services = () => {
  const search = useUIStore((s) => s.serviceSearch);
  const setSearch = useUIStore((s) => s.setServiceSearch);

  // Filter services globally here
  const filteredServices = servicesData.filter((service) =>
    service.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MultiToneBackground mainColor="#FDFFE0">
      {/* Pass search props */}
      <ServiceHeader search={search} setSearch={setSearch} />
      <FlatList
        data={[]} // no data, but required
        renderItem={null}
        ListHeaderComponent={
          <SearchService filteredServices={filteredServices} />
        }
        showsVerticalScrollIndicator={false}
      />
    </MultiToneBackground>
  );
};

export default Services;
