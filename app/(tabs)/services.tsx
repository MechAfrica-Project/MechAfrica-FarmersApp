import { FlatList } from "react-native";
import React from "react";
import MultiToneBackground from "../components/general/MultiToneBackground";
import ServiceRequestSection from "../components/service/ServiceRequestSection";
import SearchService from "../components/service/SearchService";

const Services = () => {
  return (
    <MultiToneBackground mainColor="#FDFFE0">
      <FlatList
        data={[]} // no data, but required
        renderItem={null}
        ListHeaderComponent={
          <>
            <ServiceRequestSection />
            <SearchService />
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 64 }} // pt-[4rem]
      />
    </MultiToneBackground>
  );
};

export default Services;
