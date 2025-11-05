import { servicesData } from "@/constants/servicesData";
import React, { useState } from "react";
import { FlatList } from "react-native";
import MultiToneBackground from "../components/general/MultiToneBackground";
import SearchService from "../components/service/components/SearchService";
import ServiceHeader from "../components/service/components/ServiceHeader";

const Services = () => {
  const [search, setSearch] = useState("");

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
