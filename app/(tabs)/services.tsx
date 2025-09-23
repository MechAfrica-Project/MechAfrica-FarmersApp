import React, { useState } from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import SearchService from "../components/service/SearchService";
import ServiceHeader from "../components/service/ServiceHeader";
import { servicesData } from "@/constants/servicesData";
import { FlatList } from "react-native";

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
